# Medical Report Analysis Plugin

A comprehensive medical report processing plugin for FastGPT that provides advanced image analysis and data parsing capabilities.

## Features

- Medical report image processing
- Text extraction using AI
- Comprehensive report parsing
- Abnormal indicator detection
- Health implications generation
- MongoDB integration for data storage
- Human-in-the-loop confirmation support

## Installation

```bash
npm install @fastgpt/medical-report-plugin
```

## Configuration

Create a `.env` file with the following variables:

```env
STEPFUN_API_KEY=your_stepfun_api_key
MONGODB_URI=your_mongodb_uri
```

## Usage

```typescript
import MedicalReportPlugin from '@fastgpt/medical-report-plugin';

const plugin = new MedicalReportPlugin();

// Process a medical report
const result = await plugin.processReport({
  report_image: 'path/to/report.jpg', // or URL or base64
  api_key: 'your_api_key',
  mongo_uri: 'your_mongodb_uri',
  require_confirmation: true
});

console.log(result);
```

## API Reference

### `processReport(params: ProcessReportParams)`

Process a medical report image and extract relevant information.

Parameters:
- `report_image`: Path to image file, URL, or base64 encoded image
- `api_key`: StepFun API key
- `mongo_uri`: MongoDB connection URI
- `require_confirmation`: Whether to require human confirmation (default: true)

Returns:
- `ProcessResult` object containing parsed report data

## Development

```bash
# Install dependencies
npm install

# Run tests
npm test
```

## License

MIT
