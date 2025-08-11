# Medicare & Medicaid Plans Comparison App

A comprehensive web application for comparing Medicare Advantage and Medicaid plans based on STAR ratings, member counts, and CMS criteria performance.

## Features

### 🏥 **Plan Overview**
- **Total Plans**: View count of all Medicare Advantage and Medicaid plans
- **Average STAR Rating**: Overall rating across all plans with visual star display
- **Total Members**: Aggregate member count across all plans
- **Top Rated Plans**: Count of plans with 4.5+ star ratings

### ⭐ **STAR Rating Analysis**
- **Rating Distribution**: Visual breakdown of plans by star levels (1-5 stars)
- **Rating Factors**: Detailed analysis of individual CMS quality measures:
  - Preventive Care
  - Chronic Disease Management
  - Member Experience
  - Pharmacy Services
  - Care Coordination

### 🔍 **Plan Comparison**
- **Side-by-Side Comparison**: Compare up to 4 plans simultaneously
- **Key Metrics**: STAR rating, member count, plan type, and CMS failure count
- **Interactive Selection**: Add/remove plans from comparison view

### 📊 **CMS Criteria Analysis**
- **Performance Tracking**: Monitor how plans perform against CMS quality measures
- **Failure Identification**: Track specific criteria where plans fall short
- **Impact Assessment**: Categorize failures by impact level (High, Medium, Low)
- **Target vs. Actual**: Compare expected vs. achieved performance metrics

### 🎯 **Advanced Filtering**
- **Plan Type**: Filter by Medicare Advantage or Medicaid plans
- **STAR Rating**: Filter by minimum star rating (1-5 stars)
- **State**: Filter by geographic location
- **Real-time Updates**: Dynamic filtering with instant results

## Data Structure

### Plan Information
Each plan includes:
- **Basic Details**: Name, type, state, STAR rating, member count
- **CMS Criteria Scores**: Individual ratings for 5 key quality measures
- **CMS Failures**: Specific criteria where the plan doesn't meet targets
- **Performance Metrics**: Target vs. actual performance data

### CMS Quality Measures
1. **Preventive Care**: Screening and vaccination rates
2. **Chronic Disease Management**: Care coordination for chronic conditions
3. **Member Experience**: Satisfaction and access metrics
4. **Pharmacy Services**: Medication management and adherence
5. **Care Coordination**: Integration of care across providers

## How to Use

### 1. **Getting Started**
- Open `index.html` in any modern web browser
- The app loads with sample data and displays the overview dashboard

### 2. **Exploring Plans**
- **Overview Tab**: View summary statistics and all plans in a sortable table
- **Plan Comparison Tab**: Select plans to compare side-by-side
- **STAR Analysis Tab**: Analyze rating distributions and factors
- **CMS Criteria Tab**: Review performance against quality measures

### 3. **Filtering and Searching**
- Use the filter dropdowns to narrow down plans by type, rating, or state
- Filters update results in real-time
- Combine multiple filters for precise results

### 4. **Plan Details**
- Click the "Details" button on any plan row to view comprehensive information
- Modal shows detailed CMS criteria performance and failure analysis
- Identify specific areas where plans need improvement

### 5. **Comparing Plans**
- Click "Compare" button to add plans to comparison view
- Compare up to 4 plans simultaneously
- View key metrics side-by-side for easy analysis

## Technical Details

### **Frontend Technologies**
- **HTML5**: Semantic markup with modern structure
- **CSS3**: Responsive design with CSS Grid and Flexbox
- **JavaScript (ES6+)**: Object-oriented architecture with modern syntax
- **Font Awesome**: Icons for enhanced user experience
- **Google Fonts**: Inter font family for clean typography

### **Architecture**
- **Class-based Design**: Main `MedicareMedicaidApp` class for organization
- **Event-driven**: Responsive UI with event listeners
- **Data-driven**: Dynamic content generation from plan data
- **Responsive**: Mobile-first design with breakpoint optimization

### **Browser Compatibility**
- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## Sample Data

The application includes realistic sample data for 8 plans:
- **Medicare Advantage Plans**: Humana Gold Plus, Anthem Blue Cross, Kaiser Permanente, Blue Cross Blue Shield
- **Medicaid Plans**: Aetna Better Health, UnitedHealthcare Community Plan, Molina Healthcare, Centene Corporation

Each plan includes realistic STAR ratings, member counts, and CMS performance data.

## Future Enhancements

### **Data Integration**
- API integration with CMS data sources
- Real-time data updates
- Historical performance tracking

### **Advanced Analytics**
- Trend analysis over time
- Predictive modeling for STAR ratings
- Benchmarking against industry standards

### **User Features**
- User accounts and saved comparisons
- Export functionality (PDF, Excel)
- Email notifications for plan updates

### **Mobile App**
- Native iOS and Android applications
- Push notifications for plan changes
- Offline data access

## Getting Started

1. **Clone or Download** the application files
2. **Open** `index.html` in your web browser
3. **Explore** the different tabs and features
4. **Filter** plans based on your criteria
5. **Compare** plans side-by-side
6. **Analyze** STAR ratings and CMS performance

## Support

For questions or support:
- Review the code comments for technical details
- Check browser console for any JavaScript errors
- Ensure you're using a modern, supported browser

## License

This application is provided as-is for educational and demonstration purposes. The sample data is fictional and should not be used for actual healthcare decisions.

---

**Note**: This application is designed to demonstrate the capabilities of a Medicare/Medicaid plan comparison system. In a production environment, it would integrate with real CMS data sources and include additional security and compliance measures required for healthcare applications. 