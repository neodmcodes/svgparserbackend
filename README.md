# SVG Parser Backend

A Node.js + TypeScript backend API for uploading, parsing, and analyzing SVG files.

## Features

- Upload SVG files via multipart/form-data
- Parse SVG metadata (width, height)
- Extract rectangle elements with properties
- Calculate coverage ratio
- Detect issues (EMPTY, OUT_OF_BOUNDS)
- RESTful API endpoints for managing designs

## Prerequisites

- Node.js (v16 or higher)
- MongoDB (v5 or higher)
- npm or yarn

## Installation

1. Clone the repository and navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory:
```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/svgparser
UPLOAD_DIR=./uploads
```

## MongoDB Setup

### Option 1: Local MongoDB Installation

1. Install MongoDB locally following the [official guide](https://www.mongodb.com/docs/manual/installation/)

2. Start MongoDB service:
   - **Windows**: MongoDB should start automatically as a service
   - **macOS**: `brew services start mongodb-community`
   - **Linux**: `sudo systemctl start mongod`

3. Verify MongoDB is running:
```bash
mongosh
```

### Option 2: Docker (Recommended)

Run MongoDB using Docker:

```bash
docker run -d \
  --name mongodb \
  -p 27017:27017 \
  -v mongodb_data:/data/db \
  mongo:latest
```

To stop MongoDB:
```bash
docker stop mongodb
```

To start MongoDB again:
```bash
docker start mongodb
```

## Running the Application

### Development Mode

```bash
npm run dev
```

### Production Mode

1. Build the TypeScript code:
```bash
npm run build
```

2. Start the server:
```bash
npm start
```

The server will start on `http://localhost:3000` (or the port specified in `.env`).

## API Endpoints

### 1. Upload SVG File

**POST** `/upload`

Upload an SVG file for processing.

**Request:**
- Content-Type: `multipart/form-data`
- Body: `file` (SVG file)

**Response:**
```json
{
  "id": "507f1f77bcf86cd799439011",
  "filename": "1234567890-example.svg",
  "status": "PENDING",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

**Example using curl:**
```bash
curl -X POST http://localhost:3000/upload \
  -F "file=@example.svg"
```

### 2. List All Designs

**GET** `/designs`

Get a list of all uploaded designs.

**Response:**
```json
[
  {
    "id": "507f1f77bcf86cd799439011",
    "filename": "example.svg",
    "status": "PROCESSED",
    "itemsCount": 5,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "issues": []
  }
]
```

### 3. Get Design by ID

**GET** `/designs/:id`

Get detailed information about a specific design.

**Response:**
```json
{
  "id": "507f1f77bcf86cd799439011",
  "filename": "example.svg",
  "status": "PROCESSED",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "metadata": {
    "svgWidth": 800,
    "svgHeight": 600
  },
  "items": [
    {
      "x": 10,
      "y": 20,
      "width": 100,
      "height": 50,
      "fill": "#ff0000"
    }
  ],
  "itemsCount": 1,
  "coverageRatio": 0.0104,
  "issues": []
}
```

### 4. Health Check

**GET** `/health`

Check if the server is running.

**Response:**
```json
{
  "status": "ok"
}
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `3000` |
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/svgparser` |
| `UPLOAD_DIR` | Directory for storing uploaded files | `./uploads` |

## Project Structure

```
backend/
├── src/
│   ├── app.ts                 # Main application entry point
│   ├── config/
│   │   └── database.ts        # MongoDB connection
│   ├── controllers/
│   │   ├── uploadController.ts
│   │   └── designController.ts
│   ├── models/
│   │   └── Design.ts         # Mongoose schema
│   ├── routes/
│   │   ├── uploadRoutes.ts
│   │   └── designRoutes.ts
│   ├── services/
│   │   ├── svgParser.ts      # SVG parsing logic
│   │   ├── fileService.ts    # File operations
│   │   └── designService.ts  # Business logic
│   └── middleware/
│       └── upload.ts         # Multer configuration
├── dist/                      # Compiled JavaScript (generated)
├── uploads/                   # Uploaded files (generated)
├── package.json
├── tsconfig.json
└── README.md
```

## Issue Detection

The system detects the following issues:

- **EMPTY**: No `<rect>` elements found in the SVG
- **OUT_OF_BOUNDS**: Any rectangle extends beyond the SVG boundaries (x + width > svgWidth or y + height > svgHeight)

## Coverage Ratio

The coverage ratio is calculated as:
```
coverageRatio = totalRectanglesArea / (svgWidth * svgHeight)
```

Where `totalRectanglesArea` is the sum of all rectangle areas (width × height).

## Error Handling

The API returns appropriate HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request (e.g., invalid file type)
- `404` - Not Found
- `500` - Internal Server Error

## License

ISC

