# Product Requirements Document (PRD)
## Timesheet Analyzer Application

---

## 1. Executive Summary

### 1.1 Product Vision
Timesheet Analyzer is a web-based analytics tool designed to provide comprehensive insights into team time tracking data. The application transforms raw timesheet exports into actionable business intelligence, enabling design team managers to monitor resource allocation, project distribution, and operational activities.

### 1.2 Target Audience
- Design team managers and leads
- Project managers overseeing multiple projects
- Operations managers tracking team capacity
- HR personnel monitoring employee FTE (Full-Time Equivalent)

### 1.3 Key Value Proposition
- Automated analysis of complex timesheet data
- Visual representation of resource allocation across projects
- Real-time comparison of planned vs. actual FTE
- Detailed breakdown of operational activities
- Export capabilities for reporting and presentations

---

## 2. Product Overview

### 2.1 Product Description
A Streamlit-based web application that processes timesheet data exported from Costlocker (or similar time tracking systems) and generates comprehensive analytics including project breakdowns, FTE calculations, personnel utilization, and operational activity categorization.

### 2.2 Core Functionality
1. Data import from Excel files
2. Automatic calculation of working hours based on Czech holidays
3. FTE calculation and analysis
4. Project-level analytics
5. Personnel-level analytics
6. OPS activity categorization and analysis
7. Interactive visualizations
8. Multi-format data export (Excel, PNG charts)

---

## 3. Functional Requirements

### 3.1 Data Import & Processing

#### 3.1.1 File Upload
- **Input Format**: Excel (.xlsx) files
- **Required Columns**:
  - `Datum` (Date) - Date of the timesheet entry
  - `Projekt` (Project) - Project name
  - `Osoba` (Person) - Employee name
  - `Natrackováno` (Tracked) - Number of hours tracked
  - `Popis` (Description) - Activity description

#### 3.1.2 Data Validation
- Automatic date parsing and validation
- Error handling for missing or malformed data
- User-friendly error messages indicating required columns

### 3.2 Working Hours Calculation

#### 3.2.1 Business Rules
- Standard working day: 8 hours
- Working days: Monday through Friday
- Automatic exclusion of Czech public holidays
- Monthly working hours = (Working days - Holidays) × 8 hours

#### 3.2.2 FTE Calculation
- Formula: `FTE = Total Hours Tracked / Monthly Working Hours`
- Precision: Rounded to 2 decimal places
- Scope: Calculated per person, per project, and in aggregate

### 3.3 Project Analytics

#### 3.3.1 Metrics Calculated
- **Total Hours**: Sum of all hours tracked per project
- **Average Hours**: Mean hours per timesheet entry
- **Entry Count**: Number of timesheet records
- **FTE**: Full-time equivalent allocation
- **Share (%)**: Percentage of total time allocated

#### 3.3.2 Data Presentation
- Sortable tabular view
- Aggregate totals row
- All numeric values formatted to 2 decimal places

#### 3.3.3 Visualizations
1. **FTE by Project** - Horizontal bar chart showing FTE allocation with percentage labels
2. **Hours by Project** - Horizontal bar chart showing total hours with percentage labels

### 3.4 Personnel Analytics

#### 3.4.1 Metrics Calculated
- FTE per person for the analyzed period
- Total FTE across all personnel

#### 3.4.2 Planned vs. Actual FTE Comparison
- **Configurable Planned FTE**: Adjustable via sidebar inputs (0.0 to 1.0 in 0.05 increments)
- **Default Values**: Pre-configured for known team members
  - Standard: 1.0 FTE
  - Part-time examples: 0.5 FTE, 0.9 FTE
  - Minimal involvement: 0.05 FTE
- **Visualization**: Grouped horizontal bar chart comparing planned vs. actual

#### 3.4.3 Person-Level Visualizations
- Horizontal bar chart showing FTE per person
- Sorted by FTE value (ascending)

### 3.5 OPS Activity Analysis

#### 3.5.1 Activity Categorization
Automatic categorization based on description text matching:

| Category | Keywords | Description |
|----------|----------|-------------|
| Jobs | "jobs", "job" | Job-related activities |
| Reviews | "review" | Review activities |
| Hiring | "hiring", "interview" | Recruitment activities |
| Nespárované | (no match) | Uncategorized activities |

#### 3.5.2 OPS Project Detection
- Automatic detection of OPS project based on naming convention
- Search criteria: Project name contains both "ops" and "design" (case-insensitive)
- Error handling if no OPS project found

#### 3.5.3 OPS Analytics Views

**Aggregate View:**
- Total hours per category
- Percentage share per category
- Total summary row

**Personnel View:**
- Pivot table: Rows = Persons, Columns = Categories
- Total hours per person
- Percentage share per person
- Individual category breakdowns

**Individual Person Charts:**
- Separate horizontal bar chart for each person
- Shows distribution across all OPS categories
- Maintains consistent category ordering

#### 3.5.4 Uncategorized Items Detail
- Dedicated section for "Nespárované" (uncategorized) entries
- Displays:
  - Count of uncategorized records
  - Total hours in category
  - Detailed table with: Date, Person, Hours, Description
  - Sorted by date (descending)
- Success message when all items are properly categorized

### 3.6 Data Visualization

#### 3.6.1 Chart Specifications
- **Library**: Plotly for interactive charts
- **Orientation**: Horizontal bars for better label readability
- **Color Scheme**:
  - Primary: #FF7CAC (pink)
  - Secondary: #FFD9E5 (light pink)
- **Dimensions**: 1200px width × 400px height (standard charts)
- **Background**: White plot and paper background
- **Grid**: Light grey grid lines for readability

#### 3.6.2 Chart Types
1. **Single Bar Charts**: FTE, Hours, Activities
2. **Grouped Bar Charts**: Planned vs. Actual comparison
3. **Data Labels**: Outside positioning with values and percentages

#### 3.6.3 Chart Elements
- Title with 18pt font
- Axis labels with 14pt font
- Data point labels with 12pt font
- Legend (where applicable)
- Extended x-axis range (140% of max value) for label visibility
- Left margin: 250px, Right margin: 500px

### 3.7 Export Functionality

#### 3.7.1 Excel Export
**File Contents:**
- Sheet 1: "Projekty" - Project analysis table
- Sheet 2: "FTE podle osob" - FTE by person with totals
- Sheet 3: "OPS aktivity" - OPS activities summary
- Sheet 4: "OPS aktivity podle osob" - OPS activities by person

**File Naming**: `timesheet_analysis_YYYYMMDD.xlsx`

#### 3.7.2 Charts Export
- **Format**: ZIP archive containing PNG images
- **Image Specifications**: 1200px × 600px, PNG format
- **File Naming Convention**:
  - `01_FTE_podle_projektu.png`
  - `02_Hodiny_podle_projektu.png`
  - `03_FTE_podle_osob.png`
  - `04_Porovnani_planovane_vs_skutecne_FTE.png`
  - `05_OPS_aktivity_celkem.png`
  - `06+_OPS_aktivity_{person_name}.png`
- **Archive Naming**: `timesheet_charts_YYYYMMDD.zip`
- **Dependency**: Requires Kaleido library for PNG conversion
- **Fallback**: Warning message if export unavailable (e.g., on Streamlit Cloud)

---

## 4. User Interface Requirements

### 4.1 Layout Structure

#### 4.1.1 Page Configuration
- **Layout**: Wide mode for maximum data visibility
- **Icon**: 📊
- **Title**: "Timesheet Analyzer"
- **Sidebar**: Expanded by default

#### 4.1.2 Main Sections (Top to Bottom)
1. **Header**: Application title and subtitle
2. **Period Information**: Display current analysis period and working hours
3. **Project Analysis Section**
4. **Personnel Analysis Section**
5. **OPS Activities Section**
6. **Export Section**

### 4.2 Sidebar Components

#### 4.2.1 File Upload
- Header: "⚙️ Nastavení"
- File uploader widget
- Accepted format: .xlsx only
- Help text: "Nahrajte export z Costlocker"

#### 4.2.2 Planned FTE Configuration
- Header: "🎯 Plánované FTE"
- Number input per person
- Range: 0.0 to 1.0
- Step: 0.05
- Persistent state via unique keys

### 4.3 Content Area Layout

#### 4.3.1 Two-Column Layouts
Used for:
- Project overview (table + metrics)
- Personnel overview (table + metrics)
- OPS activities overview (aggregate + by person)
- Export buttons

#### 4.3.2 Full-Width Elements
- Period information banner
- Section headers
- All charts and visualizations
- Detailed uncategorized items table

### 4.4 Table Styling

#### 4.4.1 CSS Customizations
- No text wrapping in cells (`white-space: nowrap`)
- No horizontal scrollbars (overflow-x: visible)
- Auto-width tables
- Full cell content visibility

#### 4.4.2 Number Formatting
- All numeric columns: 2 decimal places
- Consistent formatting across all tables
- Integer display for count columns

### 4.5 Empty State

When no file is uploaded:
- Info message: "👆 Nahrajte Excel soubor v postranním panelu pro začátek analýzy"
- Expected data format guide
- Column requirements list

---

## 5. Technical Requirements

### 5.1 Technology Stack

#### 5.1.1 Core Framework
- **Python 3.9+**
- **Streamlit 1.28.0+**: Web application framework

#### 5.1.2 Data Processing
- **Pandas 2.0.0+**: Data manipulation and analysis
- **NumPy 1.24.0+**: Numerical computations

#### 5.1.3 Business Logic
- **holidays 0.35+**: Czech holiday calendar
- **openpyxl 3.1.0+**: Excel file reading/writing

#### 5.1.4 Visualization
- **Plotly 5.17.0+**: Interactive charts
- **Kaleido 0.2.1+**: Static image export (optional)

### 5.2 Data Processing Requirements

#### 5.2.1 Performance
- Support for datasets with hundreds of timesheet entries
- Real-time recalculation when planned FTE values change
- Responsive UI with minimal lag

#### 5.2.2 Memory Management
- Efficient DataFrame operations
- In-memory processing only (no database required)
- BytesIO for export file generation

### 5.3 Browser Compatibility
- Modern browsers with JavaScript enabled
- Responsive design for desktop viewports (minimum 1200px recommended)
- No mobile optimization required (desktop-focused tool)

### 5.4 Deployment Options

#### 5.4.1 Local Deployment
- Run via: `streamlit run app.py`
- Access: http://localhost:8501
- Full functionality including chart export

#### 5.4.2 Cloud Deployment
- Compatible with Streamlit Cloud
- Chart export may be limited (Kaleido dependency)
- All other features fully functional

---

## 6. Non-Functional Requirements

### 6.1 Usability
- Intuitive file upload process
- Clear error messages in Czech language
- Automatic data processing upon file upload
- No manual refresh required when adjusting planned FTE
- Visual feedback during processing

### 6.2 Reliability
- Graceful error handling for malformed data
- Fallback messages for missing dependencies
- Validation of required columns before processing

### 6.3 Localization
- Primary language: Czech (Česky)
- UI labels, messages, and chart titles in Czech
- Date format: YYYY-MM-DD
- Number format: Decimal point notation

### 6.4 Data Privacy
- No data persistence (client-side processing only)
- No external API calls with user data
- Files processed in memory and discarded on session end

### 6.5 Performance Benchmarks
- File upload processing: < 5 seconds for typical datasets
- Chart rendering: < 2 seconds per visualization
- Excel export generation: < 3 seconds
- ZIP chart export: < 10 seconds (depending on chart count)

---

## 7. User Workflows

### 7.1 Primary Workflow: Analyze Timesheet Data

**Steps:**
1. User opens application in browser
2. User uploads Excel file via sidebar
3. Application validates file format and columns
4. Application displays period information
5. User reviews project analytics (tables and charts)
6. User reviews personnel analytics
7. User adjusts planned FTE values in sidebar (optional)
8. Application updates comparison chart in real-time
9. User reviews OPS activities breakdown
10. User reviews uncategorized items (if any)
11. User exports Excel report and/or chart images

**Success Criteria:**
- All data processed without errors
- All visualizations rendered correctly
- Export files generated successfully

### 7.2 Secondary Workflow: Adjust Planned FTE

**Steps:**
1. User navigates to sidebar "Plánované FTE" section
2. User modifies number input for specific person(s)
3. Application automatically recalculates comparison
4. User views updated "Porovnání plánovaného a skutečného FTE" chart

**Success Criteria:**
- Changes reflected immediately
- Chart updates without page reload
- Accurate calculations maintained

### 7.3 Error Recovery Workflow

**Steps:**
1. User uploads invalid file
2. Application displays error message
3. Error message explains the issue
4. Application provides guidance (expected format)
5. User corrects file and re-uploads

**Success Criteria:**
- Clear, actionable error messages
- No application crash
- User can recover without restarting application

---

## 8. Future Enhancements (Out of Scope for V1)

### 8.1 Potential Features
- Multi-month analysis and trends
- Custom category definitions via UI
- Direct integration with Costlocker API
- PDF report generation
- Email report scheduling
- User authentication and saved configurations
- Project budget vs. actual comparisons
- Resource forecasting
- Team capacity planning tools
- Custom date range selection
- Drill-down into individual timesheet entries

### 8.2 Technical Improvements
- Database integration for historical data
- Caching mechanisms for large datasets
- Mobile-responsive design
- Dark mode support
- Multi-language support
- Advanced filtering and search capabilities

---

## 9. Success Metrics

### 9.1 Adoption Metrics
- Number of unique users per month
- Number of files analyzed per week
- Frequency of return visits

### 9.2 Usage Metrics
- Average time spent in application per session
- Most frequently viewed sections
- Export feature usage rate

### 9.3 Quality Metrics
- Error rate during file processing
- User-reported issues count
- Average session completion rate

---

## 10. Constraints and Assumptions

### 10.1 Constraints
- Czech business calendar only (holidays package)
- Single-month analysis per upload
- Desktop-oriented interface
- Requires specific Excel column structure
- Chart export dependent on Kaleido library

### 10.2 Assumptions
- Users have access to Costlocker exports in specified format
- Users understand FTE concept and calculations
- Primary users are Czech-speaking design team managers
- Users have reliable internet connection for cloud deployment
- Data files contain complete and accurate information

---

## 11. Acceptance Criteria

### 11.1 Must Have (V1)
- ✅ Upload and process Excel files with required columns
- ✅ Calculate working hours based on Czech holidays
- ✅ Display project-level analytics with FTE
- ✅ Display personnel-level analytics with FTE
- ✅ Show planned vs. actual FTE comparison
- ✅ Categorize and analyze OPS activities
- ✅ Generate all specified visualizations
- ✅ Export data to Excel format
- ✅ Export charts to PNG (when supported)
- ✅ Display uncategorized items detail
- ✅ Handle errors gracefully with Czech messages

### 11.2 Should Have
- ✅ Customizable planned FTE per person
- ✅ Individual OPS activity charts per person
- ✅ Sortable and formatted tables
- ✅ Responsive chart interactions (zoom, pan, hover)

### 11.3 Nice to Have
- Chart export fallback messaging
- Performance optimization for large datasets
- Enhanced visual design and branding

---

## 12. Appendix

### 12.1 Glossary
- **FTE (Full-Time Equivalent)**: Measurement of employee workload, where 1.0 = full-time capacity
- **OPS**: Operational activities project
- **Costlocker**: Time tracking and project management system
- **Streamlit**: Python framework for building data applications
- **Nespárované**: Uncategorized/unmatched items

### 12.2 Sample Data Structure

```
| Datum      | Projekt        | Osoba         | Natrackováno | Popis              |
|------------|----------------|---------------|--------------|-------------------|
| 2024-11-01 | Design OPS     | Jan Novák     | 4.5          | Jobs review       |
| 2024-11-01 | Client Project | Jan Novák     | 3.5          | UI design         |
| 2024-11-02 | Design OPS     | Eva Svobodová | 2.0          | Interview prep    |
```

### 12.3 Color Palette
- Primary Pink: #FF7CAC
- Light Pink: #FFD9E5
- Text Dark: #333333
- Grid Grey: lightgrey
- Background: white

---

**Document Version**: 1.0
**Last Updated**: 2024-12-29
**Author**: Product Team
**Status**: Final - Ready for Development
