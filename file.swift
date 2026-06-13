import SwiftUI
import Charts // Modern iOS Data Visualization

// MARK: - Models
struct GlucoseReading: Identifiable {
    let id = UUID()
    let date: Date
    let level: Double // mg/dL
}

struct LabResult: Identifiable {
    let id = UUID()
    let testName: String
    let value: Double
    let unit: String
    let status: HealthStatus // Green, Yellow, Red
    let date: Date
}

enum HealthStatus {
    case normal    // Green
    case borderline // Yellow
    case abnormal  // Red
    
    var color: Color {
        switch self {
        case .normal: return Color.green
        case .borderline: return Color.orange
        case .abnormal: return Color.red
        }
    }
}

struct Medication: Identifiable {
    let id = UUID()
    let name: String
    let dosage: String
    let isNighttime: Bool
}

struct NewsItem: Identifiable {
    let id = UUID()
    let title: String
    let category: String // Longevity, Diabetes, Medical News
    let summary: String
    let timestamp: String
}

struct ChatMessage: Identifiable {
    let id = UUID()
    let isUser: Bool
    let text: String
}

// MARK: - View Model (State Management)
class HealthViewModel: ObservableObject {
    @Published var userName: String = "Mikail KOCAK"
    @Published var birthDate: String = "July 23, 1979"
    @Published var selectedPhoto: String = "person.crop.circle.fill" // SF Symbol placeholder
    
    // Core Data Lists
    @Published var readings: [GlucoseReading] = [
        GlucoseReading(date: Date().addingTimeInterval(-86400 * 4), level: 120),
        GlucoseReading(date: Date().addingTimeInterval(-86400 * 3), level: 135),
        GlucoseReading(date: Date().addingTimeInterval(-86400 * 2), level: 110),
        GlucoseReading(date: Date().addingTimeInterval(-86400 * 1), level: 145),
        GlucoseReading(date: Date(), level: 118)
    ]
    
    @Published var labResults: [LabResult] = [
        LabResult(testName: "Fasting Glucose", value: 95, unit: "mg/dL", status: .normal, date: Date()),
        LabResult(testName: "Total Cholesterol", value: 210, unit: "mg/dL", status: .borderline, date: Date()),
        LabResult(testName: "Triglycerides", value: 180, unit: "mg/dL", status: .abnormal, date: Date())
    ]
    
    @Published var medications: [Medication] = [
        Medication(name: "Metformin", dosage: "500mg", isNighttime: false),
        Medication(name: "Vitamin D3", dosage: "2000 IU", isNighttime: false),
        Medication(name: "Magnesium Glycinate", dosage: "400mg", isNighttime: true)
    ]
    
    @Published var chatMessages: [ChatMessage] = [
        ChatMessage(isUser: false, text: "Hello Mikail. I am your AI Health Assistant. How can I assist you with your health parameters today?")
    ]
    
    @Published var newsFeed: [NewsItem] = [
        NewsItem(title: "New Insights in Longevity & NAD+ Boosters", category: "Longevity", summary: "Recent clinical trials confirm the metabolic benefits of oral NAD precursors on muscle sensitivity and glucose disposal.", timestamp: "Updated 15 mins ago"),
        NewsItem(title: "Artificial Intelligence in Type 1 & 2 Management", category: "Diabetes", summary: "Automated glucose forecasting algorithms reach 95% accuracy in preventing nocturnal hypoglycemia.", timestamp: "Updated 45 mins ago"),
        NewsItem(title: "Continuous Glucose Monitor Interoperability", category: "Medical News", summary: "FDA approves seamless API access for the latest generation of minimally invasive biosensors.", timestamp: "Updated 1 hour ago")
    ]
    
    // Computed Averages & Estimates
    var averageGlucose: Double {
        guard !readings.isEmpty else { return 0.0 }
        let total = readings.reduce(0.0) { $0 + $1.level }
        return total / Double(readings.count)
    }
    
    // HbA1c Math: (Average Glucose + 46.7) / 28.7
    var estimatedHbA1c: Double {
        guard averageGlucose > 0 else { return 0.0 }
        return (averageGlucose + 46.7) / 28.7
    }
    
    // Action Methods
    func addGlucoseReading(level: Double) {
        let newReading = GlucoseReading(date: Date(), level: level)
        readings.append(newReading)
    }
    
    func addMedication(name: String, dosage: String, isNighttime: Bool) {
        let newMed = Medication(name: name, dosage: dosage, isNighttime: isNighttime)
        medications.append(newMed)
    }
    
    func deleteMedication(at offsets: IndexSet) {
        medications.remove(atOffsets: offsets)
    }
    
    func sendChatMessage(text: String) {
        guard !text.trimmingCharacters(in: .whitespaces).isEmpty else { return }
        chatMessages.append(ChatMessage(isUser: true, text: text))
        
        // Simulating immediate response from AI Agent
        DispatchQueue.main.asyncAfter(deadline: .now() + 1.0) {
            self.chatMessages.append(ChatMessage(isUser: false, text: "I've noted that. As your AI Assistant, I advise monitoring your daily trends closely. Please make sure to consult with your actual endocrinologist for clinical dosage adjustments."))
        }
    }
}

// MARK: - Color Palette Extensions
extension Color {
    static let celesteBackground = Color(red: 0.92, green: 0.97, blue: 1.0)
    static let medicalBlue = Color(red: 0.12, green: 0.53, blue: 0.90)
    static let lightGrayBg = Color(red: 0.97, green: 0.97, blue: 0.98)
}

// MARK: - Root View
struct ContentView: View {
    @StateObject private var viewModel = HealthViewModel()
    
    init() {
        // Standardize TabBar Design
        UITabBar.appearance().backgroundColor = .white
    }
    
    var body: some View {
        TabView {
            DashboardView()
                .tabItem {
                    Label("Dashboard", systemImage: "heart.text.square.fill")
                }
            
            LabResultsView()
                .tabItem {
                    Label("Lab Results", systemImage: "doc.text.magnifyingglass")
                }
            
            MedicationsView()
                .tabItem {
                    Label("Medications", systemImage: "pills.fill")
                }
            
            AIDoctorView()
                .tabItem {
                    Label("AI Dr.", systemImage: "brain.head.profile")
                }
            
            HistoryAndNewsView()
                .tabItem {
                    Label("History & News", systemImage: "newspaper.fill")
                }
        }
        .accentColor(.medicalBlue)
        .environmentObject(viewModel)
    }
}

// MARK: - 1. Dashboard View
struct DashboardView: View {
    @EnvironmentObject var vm: HealthViewModel
    @State private var newReadingInput: String = ""
    
    var body: some View {
        NavigationView {
            ScrollView {
                VStack(spacing: 20) {
                    // Profile Header
                    HStack(spacing: 15) {
                        Image(systemName: vm.selectedPhoto)
                            .resizable()
                            .aspectRatio(contentMode: .fit)
                            .frame(width: 65, height: 65)
                            .foregroundColor(.medicalBlue)
                            .background(Circle().fill(Color.celesteBackground))
                        
                        VStack(alignment: .leading, spacing: 4) {
                            Text(vm.userName)
                                .font(.system(size: 22, weight: .bold))
                                .foregroundColor(.black)
                            Text("Born: \(vm.birthDate) (Age: 46)")
                                .font(.subheadline)
                                .foregroundColor(.secondary)
                        }
                        Spacer()
                    }
                    .padding(.horizontal)
                    .padding(.top, 10)
                    
                    // Main Summary Cards
                    HStack(spacing: 15) {
                        // Average Glucose Card
                        VStack(alignment: .leading) {
                            Text("AVERAGE GLUCOSE")
                                .font(.caption)
                                .fontWeight(.semibold)
                                .foregroundColor(.secondary)
                            Spacer()
                            Text(String(format: "%.1f", vm.averageGlucose))
                                .font(.system(size: 32, weight: .bold))
                                .foregroundColor(.medicalBlue)
                            Text("mg/dL")
                                .font(.caption)
                                .foregroundColor(.secondary)
                        }
                        .padding()
                        .frame(maxWidth: .infinity, minHeight: 120)
                        .background(Color.white)
                        .cornerRadius(16)
                        .shadow(color: Color.black.opacity(0.04), radius: 8, x: 0, y: 4)
                        
                        // Estimated HbA1c Card
                        VStack(alignment: .leading) {
                            Text("ESTIMATED HBA1C")
                                .font(.caption)
                                .fontWeight(.semibold)
                                .foregroundColor(.secondary)
                            Spacer()
                            Text(String(format: "%.2f%%", vm.estimatedHbA1c))
                                .font(.system(size: 32, weight: .bold))
                                .foregroundColor(.green)
                            Text("Based on recent scans")
                                .font(.system(size: 10))
                                .foregroundColor(.secondary)
                        }
                        .padding()
                        .frame(maxWidth: .infinity, minHeight: 120)
                        .background(Color.white)
                        .cornerRadius(16)
                        .shadow(color: Color.black.opacity(0.04), radius: 8, x: 0, y: 4)
                    }
                    .padding(.horizontal)
                    
                    // Simple Bar Chart
                    VStack(alignment: .leading, spacing: 10) {
                        Text("Glucose Levels (Daily History)")
                            .font(.headline)
                            .foregroundColor(.black)
                            .padding(.horizontal)
                        
                        Chart {
                            ForEach(vm.readings) { reading in
                                LineMark(
                                    x: .value("Date", reading.date, unit: .day),
                                    y: .value("Glucose Level", reading.level)
                                )
                                .foregroundStyle(Color.medicalBlue)
                                .interpolationMethod(.catmullRom)
                                
                                PointMark(
                                    x: .value("Date", reading.date, unit: .day),
                                    y: .value("Glucose Level", reading.level)
                                )
                                .foregroundStyle(Color.medicalBlue)
                            }
                        }
                        .frame(height: 180)
                        .padding()
                    }
                    .background(Color.white)
                    .cornerRadius(16)
                    .padding(.horizontal)
                    .shadow(color: Color.black.opacity(0.03), radius: 8, x: 0, y: 4)
                    
                    // Add Daily Reading Section
                    VStack(alignment: .leading, spacing: 12) {
                        Text("Log New Glucose Level")
                            .font(.subheadline)
                            .bold()
                        HStack {
                            TextField("Enter Level (e.g., 120)", text: $newReadingInput)
                                .keyboardType(.numberPad)
                                .textFieldStyle(RoundedBorderTextFieldStyle())
                                .frame(height: 40)
                            
                            Button(action: {
                                if let val = Double(newReadingInput) {
                                    vm.addGlucoseReading(level: val)
                                    newReadingInput = ""
                                }
                            }) {
                                Text("Submit")
                                    .fontWeight(.bold)
                                    .foregroundColor(.white)
                                    .padding(.horizontal, 20)
                                    .frame(height: 40)
                                    .background(Color.medicalBlue)
                                    .cornerRadius(10)
                            }
                        }
                    }
                    .padding()
                    .background(Color.celesteBackground.opacity(0.6))
                    .cornerRadius(16)
                    .padding(.horizontal)
                    
                }
                .padding(.bottom, 20)
            }
            .background(Color.lightGrayBg.ignoresSafeArea())
            .navigationTitle("Healthy Tracker")
            .navigationBarTitleDisplayMode(.inline)
        }
    }
}

// MARK: - 2. Lab Results View
struct LabResultsView: View {
    @EnvironmentObject var vm: HealthViewModel
    @State private var showingImagePicker = false
    
    var body: some View {
        NavigationView {
            List {
                Section(header: Text("Dynamic Analysis OCR (Photo/PDF)")) {
                    VStack(alignment: .leading, spacing: 12) {
                        Text("Upload Your Clinical PDF or Lab Photo")
                            .font(.headline)
                        Text("The integrated AI automatically parses health indicators, marking optimal ranges in green, warning thresholds in yellow, and critical values in red.")
                            .font(.caption)
                            .foregroundColor(.secondary)
                        
                        Button(action: {
                            showingImagePicker = true
                        }) {
                            HStack {
                                Image(systemName: "photo.on.rectangle.angled")
                                Text("Select Photo / PDF")
                            }
                            .font(.subheadline)
                            .fontWeight(.bold)
                            .foregroundColor(.white)
                            .frame(maxWidth: .infinity, minHeight: 45)
                            .background(Color.medicalBlue)
                            .cornerRadius(10)
                        }
                    }
                    .padding(.vertical, 8)
                }
                
                Section(header: Text("Analyzed Biomarkers")) {
                    ForEach(vm.labResults) { result in
                        HStack {
                            // Categorized status indicators (Green, Yellow, Red)
                            Circle()
                                .fill(result.status.color)
                                .frame(width: 14, height: 14)
                            
                            VStack(alignment: .leading) {
                                Text(result.testName)
                                    .font(.subheadline)
                                    .fontWeight(.semibold)
                                Text(result.date.formatted(date: .abbreviated, time: .omitted))
                                    .font(.caption2)
                                    .foregroundColor(.secondary)
                            }
                            
                            Spacer()
                            
                            Text("\(Int(result.value)) \(result.unit)")
                                .font(.subheadline)
                                .fontWeight(.bold)
                        }
                        .padding(.vertical, 4)
                    }
                }
            }
            .listStyle(InsetGroupedListStyle())
            .navigationTitle("Lab Diagnostics")
        }
    }
}

// MARK: - 3. Medications & Supplement Manager View
struct MedicationsView: View {
    @EnvironmentObject var vm: HealthViewModel
    @State private var showAddModal = false
    @State private var medName = ""
    @State private var dosageInput = ""
    @State private var isNight = false
    
    var body: some View {
        NavigationView {
            VStack {
                // Interactive List
                List {
                    Section(header: Text("AI Recommendation Panel")) {
                        HStack(alignment: .top, spacing: 12) {
                            Image(systemName: "wand.and.stars")
                                .foregroundColor(.amber)
                                .font(.title2)
                            VStack(alignment: .leading, spacing: 5) {
                                Text("Chronobiology Insights")
                                    .font(.subheadline)
                                    .fontWeight(.bold)
                                Text("Vitamin D3 should be administered alongside breakfast or high-fat meals. Magnesium is highly bioavailable during the evening as it relaxes neuromuscular pathways.")
                                    .font(.caption)
                                    .foregroundColor(.secondary)
                            }
                        }
                        .padding(.vertical, 4)
                    }
                    
                    Section(header: Text("☀️ Daytime Medications")) {
                        ForEach(vm.medications.filter { !$0.isNighttime }) { med in
                            HStack {
                                Image(systemName: "sun.max.fill")
                                    .foregroundColor(.orange)
                                Text(med.name)
                                    .fontWeight(.medium)
                                Spacer()
                                Text(med.dosage)
                                    .foregroundColor(.secondary)
                            }
                        }
                        .onDelete(perform: vm.deleteMedication)
                    }
                    
                    Section(header: Text("🌙 Nighttime Medications")) {
                        ForEach(vm.medications.filter { $0.isNighttime }) { med in
                            HStack {
                                Image(systemName: "moon.stars.fill")
                                    .foregroundColor(.indigo)
                                Text(med.name)
                                    .fontWeight(.medium)
                                Spacer()
                                Text(med.dosage)
                                    .foregroundColor(.secondary)
                            }
                        }
                        .onDelete(perform: vm.deleteMedication)
                    }
                }
                .listStyle(InsetGroupedListStyle())
                
                // Add Button
                Button(action: { showAddModal = true }) {
                    HStack {
                        Image(systemName: "plus.circle.fill")
                        Text("Add Medication Manually")
                    }
                    .font(.headline)
                    .foregroundColor(.white)
                    .frame(maxWidth: .infinity, minHeight: 50)
                    .background(Color.medicalBlue)
                    .cornerRadius(12)
                    .padding()
                }
            }
            .navigationTitle("Prescriptions")
            .sheet(isPresented: $showAddModal) {
                NavigationView {
                    Form {
                        Section(header: Text("Medication Details")) {
                            TextField("Name", text: $medName)
                            TextField("Dosage", text: $dosageInput)
                            Toggle("Nighttime Administration", isOn: $isNight)
                        }
                        
                        Button("Save Entry") {
                            if !medName.isEmpty {
                                vm.addMedication(name: medName, dosage: dosageInput, isNighttime: isNight)
                                medName = ""
                                dosageInput = ""
                                isNight = false
                                showAddModal = false
                            }
                        }
                        .disabled(medName.isEmpty)
                    }
                    .navigationTitle("Add New Entry")
                    .navigationBarItems(trailing: Button("Cancel") { showAddModal = false })
                }
            }
        }
    }
}

// MARK: - 4. AI Dr. View
struct AIDoctorView: View {
    @EnvironmentObject var vm: HealthViewModel
    @State private var chatText = ""
    
    var body: some View {
        NavigationView {
            VStack {
                ScrollView {
                    VStack(spacing: 12) {
                        ForEach(vm.chatMessages) { msg in
                            HStack {
                                if msg.isUser {
                                    Spacer()
                                    Text(msg.text)
                                        .padding()
                                        .background(Color.medicalBlue)
                                        .foregroundColor(.white)
                                        .cornerRadius(16, corners: [.topLeft, .bottomLeft, .bottomRight])
                                } else {
                                    Text(msg.text)
                                        .padding()
                                        .background(Color.celesteBackground)
                                        .foregroundColor(.black)
                                        .cornerRadius(16, corners: [.topRight, .bottomLeft, .bottomRight])
                                    Spacer()
                                }
                            }
                            .padding(.horizontal)
                        }
                    }
                    .padding(.top)
                }
                
                // Text Area Input
                HStack {
                    TextField("Inquire with your AI Health Agent...", text: $chatText)
                        .textFieldStyle(RoundedBorderTextFieldStyle())
                        .frame(minHeight: 40)
                    
                    Button(action: {
                        vm.sendChatMessage(text: chatText)
                        chatText = ""
                    }) {
                        Image(systemName: "paperplane.fill")
                            .foregroundColor(.white)
                            .padding(10)
                            .background(Color.medicalBlue)
                            .clipShape(Circle())
                    }
                }
                .padding()
                .background(Color.white)
            }
            .background(Color.lightGrayBg.ignoresSafeArea())
            .navigationTitle("AI Medical Agent")
        }
    }
}

// MARK: - 5. History & News View
struct HistoryAndNewsView: View {
    @EnvironmentObject var vm: HealthViewModel
    @State private var exportStatus = "Export All Logs to PDF"
    @State private var isExporting = false
    
    var body: some View {
        NavigationView {
            List {
                Section(header: Text("Export Center")) {
                    VStack(alignment: .leading, spacing: 8) {
                        Text("Historical Data Compendium")
                            .font(.headline)
                        Text("Package and securely compile all logged values, diagnostics, average metrics, and schedules into a highly formatted, print-ready PDF file for presentation to your clinical physician.")
                            .font(.caption2)
                            .foregroundColor(.secondary)
                        
                        Button(action: {
                            isExporting = true
                            exportStatus = "Generating PDF..."
                            DispatchQueue.main.asyncAfter(deadline: .now() + 1.5) {
                                isExporting = false
                                exportStatus = "PDF Saved to Files Successfully!"
                            }
                        }) {
                            HStack {
                                if isExporting {
                                    ProgressView()
                                        .progressViewStyle(CircularProgressViewStyle(tint: .white))
                                } else {
                                    Image(systemName: "doc.plaintext")
                                }
                                Text(exportStatus)
                            }
                            .fontWeight(.bold)
                            .foregroundColor(.white)
                            .frame(maxWidth: .infinity, minHeight: 45)
                            .background(isExporting ? Color.secondary : Color.medicalBlue)
                            .cornerRadius(10)
                        }
                    }
                    .padding(.vertical, 6)
                }
                
                Section(header: Text("Hourly AI Longevity Feed")) {
                    ForEach(vm.newsFeed) { news in
                        VStack(alignment: .leading, spacing: 6) {
                            HStack {
                                Text(news.category.uppercased())
                                    .font(.caption2)
                                    .fontWeight(.bold)
                                    .foregroundColor(.white)
                                    .padding(.horizontal, 8)
                                    .padding(.vertical, 3)
                                    .background(Color.medicalBlue.opacity(0.85))
                                    .cornerRadius(6)
                                
                                Spacer()
                                
                                Text(news.timestamp)
                                    .font(.system(size: 10))
                                    .foregroundColor(.secondary)
                            }
                            
                            Text(news.title)
                                .font(.subheadline)
                                .fontWeight(.bold)
                                .foregroundColor(.black)
                            
                            Text(news.summary)
                                .font(.caption)
                                .foregroundColor(.secondary)
                                .lineLimit(3)
                        }
                        .padding(.vertical, 8)
                    }
                }
            }
            .listStyle(InsetGroupedListStyle())
            .navigationTitle("Intelligence Hub")
        }
    }
}

// MARK: - Extension for Custom Corners
extension View {
    func cornerRadius(_ radius: CGFloat, corners: UIRectCorner) -> some View {
        clipShape(RoundedCorner(radius: radius, corners: corners))
    }
}

struct RoundedCorner: Shape {
    var radius: CGFloat = .infinity
    var corners: UIRectCorner = .allCorners

    func path(in rect: CGRect) -> Path {
        let path = UIBezierPath(roundedRect: rect, byRoundingCorners: corners, cornerRadii: CGSize(width: radius, height: radius))
        return Path(path.cgPath)
    }
}

// MARK: - App Color Definitions helper
extension Color {
    static let amber = Color.orange
}
