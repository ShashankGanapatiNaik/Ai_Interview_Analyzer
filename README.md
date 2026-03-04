Why Not Modify file.file Directly?
But problems:
❌ Problem 1: Memory Usage
If video is large (100MB+),
await file.read() loads everything into RAM.

Bad for server performance.
❌ Problem 2: Some Libraries Need File Path
OpenCV cannot process in-memory UploadFile easily.
It wants a physical file.
