# 🏥 Comprehensive Hospital EMR System with AI-Powered Predictive Analytics

A modern, intelligent hospital management system featuring real-time resource optimization, predictive analytics, and automated decision support powered by artificial intelligence.

## 🚀 Features

### Core Hospital Management

- **Dashboard**: Real-time overview of hospital operations and KPIs
- **Patient Management**: Comprehensive patient records and medical history
- **Bed Management**: Real-time bed allocation and availability tracking
- **Oxygen Monitoring**: Live oxygen level monitoring with automated alerts
- **Staff Management**: Staff scheduling, workload optimization, and resource allocation

### 🤖 AI-Powered What-If Analysis (NEW!)

- **Intelligent Scenario Planning**: Google Gemini AI integration for complex scenario analysis
- **Pre-built Scenario Library**: Emergency response, resource shortage, capacity overflow scenarios
- **Real-time Context Awareness**: AI considers current hospital status for accurate predictions
- **Structured Recommendations**: Impact analysis, risk assessment, and actionable strategies
- **Interactive Chat Interface**: Natural language queries with hospital-specific responses

### 🧠 AI-Powered Predictive Analytics

- **Resource Optimization**: AI-driven predictions for oxygen supply, bed availability, and staff allocation
- **Demand Forecasting**: 24-48 hour predictions with confidence intervals
- **Real-time Simulations**: Dynamic hospital operations simulation with seasonal patterns
- **Interactive Visualizations**: Advanced charts showing trends, predictions, and risk analysis
- **Smart Alert System**: Intelligent alerts with automated recommendations

### 🎯 Problem Statement Solution

**"Predictive Analysis for Hospital Resource Optimisation"** - This system addresses the critical need for:

1. **Oxygen Supply Optimization**: Predicts oxygen demand patterns and prevents shortages
2. **Bed Availability Management**: Forecasts bed requirements and optimizes patient flow
3. **Staff Allocation**: Predicts workload patterns and prevents staff burnout
4. **Emergency Preparedness**: Anticipates surge scenarios and resource needs

## 🛠️ Technology Stack

### Frontend

- **React 18.3.1** with TypeScript for type-safe development
- **Vite 5.4.2** for fast development and optimized builds
- **Tailwind CSS 3.4.1** for responsive, utility-first styling
- **Recharts** for interactive data visualizations
- **Lucide React** for consistent iconography

### Backend (Python Flask)

- **Flask 3.0.0** web framework for RESTful API
- **MySQL** database with connection pooling
- **SQLAlchemy** for database ORM and migrations
- **Flask-CORS** for cross-origin resource sharing
- **Python dataclasses** for type-safe data models

### AI & Analytics

- **Google Gemini AI Integration** for what-if analysis and scenario planning
- **Simulated Machine Learning Models** for predictive analytics
- **Real-time Data Processing** with temporal pattern recognition
- **Confidence Scoring** for prediction accuracy
- **Multi-parameter Optimization** algorithms
- **Natural Language Processing** for intelligent query understanding

## 📊 Predictive Analytics Features

### 1. Oxygen Supply Prediction

- **24-hour demand forecasting** with hourly granularity
- **Risk assessment** (Low, Medium, High, Critical)
- **Automated recommendations** for supply optimization
- **Confidence intervals** for prediction accuracy
- **Real-time monitoring** integration

### 2. Bed Availability Forecasting

- **48-hour availability predictions** across all ward types
- **Admission/discharge pattern analysis**
- **Capacity optimization** recommendations
- **Emergency surge planning**
- **Patient flow optimization**

### 3. Staff Workload Optimization

- **Workload prediction** and burnout prevention
- **Shift optimization** recommendations
- **Resource allocation** across departments
- **Overtime prediction** and cost analysis
- **Skills-based matching** for assignments

### 4. Emergency Demand Prediction

- **Emergency case volume forecasting**
- **Severity distribution** predictions
- **Resource preparation** recommendations
- **Surge capacity** planning
- **Multi-hospital coordination** support

## 🔔 Intelligent Alert System

### Alert Types

- **Critical Alerts**: Immediate action required (< 15 minutes)
- **Warning Alerts**: Attention needed (< 1 hour)
- **Information Alerts**: Awareness notifications
- **Predictive Alerts**: AI-generated early warnings

### Automated Recommendations

- **Priority-based** action suggestions
- **Time-estimated** implementation
- **Success rate** predictions
- **Cost analysis** for each recommendation
- **Department-specific** routing
- **One-click automation** for eligible actions

## 📈 Data Visualization

### Interactive Charts

- **Time-series predictions** with confidence bands
- **Risk distribution** pie charts
- **Trend analysis** with historical comparison
- **Real-time updates** every 30 seconds
- **Customizable timeframes** (hourly, daily, weekly)

### Dashboard Metrics

- **Overall Optimization Score** (0-100%)
- **Resource utilization** tracking
- **Prediction accuracy** monitoring
- **Alert response** times
- **System performance** indicators

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- Modern web browser with JavaScript enabled

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd Hospital_Management-main
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Start development server**

   ```bash
   npm run dev
   ```

4. **Open your browser**
   ```
   http://localhost:5173
   ```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint analysis
- `npm run preview` - Preview production build

## 🎛️ Configuration

### Simulation Settings

The system includes realistic data simulation that can be customized:

```typescript
// Simulation speed (milliseconds between updates)
realTimeSimulator.setSpeed(1000); // 1 second

// Start/stop simulation
realTimeSimulator.start();
realTimeSimulator.stop();

// Trigger specific scenarios
realTimeSimulator.simulateScenario("mass_casualty");
realTimeSimulator.simulateScenario("system_failure");
realTimeSimulator.simulateScenario("staff_shortage");
```

### Prediction Parameters

Adjust prediction models in `utils/predictiveAnalytics.ts`:

```typescript
// Model weights and features can be customized
const oxygenModel = new PredictiveModel(
  ["currentDemand", "timeOfDay", "dayOfWeek", "emergencyCases"],
  [0.4, 0.2, 0.15, 0.25] // Weights
);
```

## 🔧 Architecture

### Component Structure

```
src/
├── components/           # React components
│   ├── Dashboard.tsx    # Main dashboard
│   ├── PredictiveDashboard.tsx # AI analytics dashboard
│   ├── AlertManagement.tsx     # Smart alert system
│   ├── PredictiveCharts.tsx    # Data visualizations
│   └── [existing components]   # Patient, Bed, Oxygen, Staff management
├── utils/               # Core logic
│   ├── predictiveAnalytics.ts  # ML models and predictions
│   └── realTimeSimulator.ts    # Data simulation engine
└── [other files]
```

### Data Flow

1. **Real-time Simulator** generates realistic hospital data
2. **Predictive Analytics Engine** processes data and generates forecasts
3. **Alert System** analyzes predictions and creates intelligent alerts
4. **React Components** display insights with interactive visualizations
5. **User Actions** trigger recommendations and system optimizations

## 🎯 Key Innovations

### AI-Powered Predictions

- **Multi-parameter models** considering time, seasonality, and historical patterns
- **Confidence scoring** for prediction reliability
- **Dynamic model weights** adapting to hospital-specific patterns
- **Real-time learning** from actual vs predicted outcomes

### Smart Resource Optimization

- **Overall optimization score** combining all resource metrics
- **Automated recommendations** with priority and success rate scoring
- **Cross-resource dependencies** understanding (e.g., staff workload affects oxygen monitoring)
- **Cost-benefit analysis** for all recommended actions

### Intelligent Alert Management

- **Context-aware alerts** preventing alert fatigue
- **Automated resolution** for suitable scenarios
- **Escalation pathways** for critical situations
- **Performance tracking** for alert response effectiveness

## 📱 User Experience

### Dashboard Navigation

- **Intuitive sidebar** with module-based navigation
- **Real-time indicators** showing system status
- **Quick actions** for common tasks
- **Search functionality** across all modules

### Responsive Design

- **Mobile-first approach** ensuring usability on all devices
- **Touch-friendly interfaces** for tablet usage
- **Progressive disclosure** of complex information
- **Accessibility compliance** following WCAG guidelines

## 🔮 Future Enhancements

### Machine Learning Integration

- **Real ML models** replacing simulated algorithms
- **Historical data training** for improved accuracy
- **External data sources** (weather, traffic, events)
- **Federated learning** across hospital networks

### Advanced Features

- **Voice commands** for hands-free operation
- **Augmented reality** for equipment location
- **Blockchain** for secure patient data sharing
- **IoT integration** with medical devices

### Scalability

- **Multi-hospital support** with centralized analytics
- **Cloud deployment** with auto-scaling
- **API marketplace** for third-party integrations
- **White-label solutions** for different healthcare systems

## 🤝 Contributing

This system demonstrates advanced concepts in healthcare technology, AI-powered decision support, and modern web development. Contributions are welcome for:

- Enhanced prediction algorithms
- Additional visualization types
- Integration with real medical devices
- Performance optimizations
- Accessibility improvements

## 📄 License

This project is developed as a demonstration of predictive analytics in healthcare and is available for educational and evaluation purposes.

---

**Built with ❤️ for better healthcare outcomes through AI-powered resource optimization**
