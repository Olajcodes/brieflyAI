import pytest
from fastapi.testclient import TestClient
from app.main import app
import io

client = TestClient(app)

# 1. Validation Tests (400 Errors)
def test_summarize_text_empty_payload():
    """Verify that empty text triggers a 422/400 validation error."""
    response = client.post("/v1/summarize", json={})
    assert response.status_code == 422 # FastAPI Pydantic validation

def test_invalid_file_type():
    """Verify that disallowed file types (like images) are blocked."""
    file_data = {"file": ("test.png", b"fake-image-content", "image/png")}
    form_data = {"length_preset": "short", "output_format": "paragraph"}
    response = client.post("/v1/summarize-file", files=file_data, data=form_data)
    assert response.status_code == 400
    assert "Invalid file type" in response.json()["detail"]

# 2. Large File Handling (413 Errors)
def test_file_too_large():
    """Verify that files over 15MB are rejected."""
    large_content = b"a" * (16 * 1024 * 1024) # 16MB
    file_data = {"file": ("large.txt", large_content, "text/plain")}
    form_data = {"length_preset": "short", "output_format": "paragraph"}
    response = client.post("/v1/summarize-file", files=file_data, data=form_data)
    assert response.status_code == 413
    assert "exceeds 15MB limit" in response.json()["detail"]

# 3. Security: SSRF Protection
def test_ssrf_protection_localhost():
    """Ensure the fetcher blocks internal/private IP ranges."""
    payload = {
        "url": "http://127.0.0.1:8000/admin",
        "length_preset": "short",
        "output_format": "paragraph"
    }
    response = client.post("/v1/summarize-url", json=payload)
    # Depending on implementation, fetcher should raise 400 or 422
    assert response.status_code in [400, 422]

# 4. Successful Flow & Response Shape
def test_summarize_text_success():
    """Verify the response matches the mandatory API contract."""
    payload = {
        "text": "The quick brown fox jumps over the lazy dog. " * 20,
        "length_preset": "short",
        "output_format": "both"
    }
    response = client.post("/v1/summarize", json=payload)
    data = response.json()
    
    assert response.status_code == 200
    assert "request_id" in data
    assert "summary_paragraph" in data
    assert isinstance(data["summary_bullets"], list)
    assert "metrics" in data
    assert data["metrics"]["compression_ratio"] > 0

# 5. Scanned PDF Detection (422 Error)
def test_low_quality_pdf_extraction():
    """Verify that PDFs with no extractable text trigger 422."""
    # Simulate a PDF that results in empty text string
    # This requires mocking the parser or providing a specific test asset
    pass