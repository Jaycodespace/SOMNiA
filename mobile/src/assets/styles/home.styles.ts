import { StyleSheet, ViewStyle, TextStyle, ImageStyle } from 'react-native';

export interface Styles {
  background: ViewStyle;
  container: ViewStyle;
  header: ViewStyle;
  headerLeft: ViewStyle;
  avatar: ImageStyle;
  greeting: TextStyle;
  profileName: TextStyle;
  profileButton: ViewStyle;
  scrollView: ViewStyle;
  card: ViewStyle;
  cardTitle: TextStyle;
  statsContainer: ViewStyle;
  statItem: ViewStyle;
  statValue: TextStyle;
  statLabel: TextStyle;
  historyItem: ViewStyle;
  historyDate: TextStyle;
  historyDuration: TextStyle;
  historyQuality: TextStyle;
  profileHeader: ViewStyle;
  profileImage: ImageStyle;
  profileEmail: TextStyle;
  settingsList: ViewStyle;
  settingItem: ViewStyle;
  settingText: TextStyle;
  bottomNavContainer: ViewStyle;
  bottomNav: ViewStyle;
  navItem: ViewStyle;
  navText: TextStyle;
  navTextActive: TextStyle;
  statsBoxContainer: ViewStyle;
  statBox: ViewStyle;
  statBoxValue: TextStyle;
  statBoxUnit: TextStyle;
  statBoxLabel: TextStyle;
  recommendationItem: ViewStyle;
  recommendationIcon: ImageStyle;
  recommendationContent: ViewStyle;
  recommendationTitle: TextStyle;
  recommendationMessage: TextStyle;
  addDiaryButton: ViewStyle;
  addDiaryButtonText: TextStyle;
  modalContainer: ViewStyle;
  modalContent: ViewStyle;
  modalHeader: ViewStyle;
  modalTitle: TextStyle;
  diaryForm: ViewStyle;
  formGroup: ViewStyle;
  formLabel: TextStyle;
  formValue: TextStyle;
  timePickerButton: ViewStyle;
  timePickerText: TextStyle;
  optionsContainer: ViewStyle;
  optionButton: ViewStyle;
  optionButtonSelected: ViewStyle;
  optionText: TextStyle;
  moodContainer: ViewStyle;
  moodButton: ViewStyle;
  moodButtonSelected: ViewStyle;
  moodText: TextStyle;
  checkboxContainer: ViewStyle;
  checkbox: ImageStyle;
  checkboxSelected: ViewStyle;
  checkboxLabel: TextStyle;
  notesInput: TextStyle;
  saveButton: ViewStyle;
  saveButtonText: TextStyle;
  syncButton: ViewStyle;
  syncButtonText: TextStyle;
  sleepSummaryCard: ViewStyle;
  sectionTitle: TextStyle;
  sleepCircleRow: ViewStyle;
  sleepCircle: ViewStyle;
  sleepCircleValue: TextStyle;
  sleepCircleLabel: TextStyle;
  sleepCircleTarget: TextStyle;
  sleepSummaryText: ViewStyle;
  sleepStatus: TextStyle;
  sleepSubtext: TextStyle;
}

const styles = StyleSheet.create<Styles>({
  background: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: 48,
    backgroundColor: 'transparent',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  greeting: {
    color: '#fff',
    fontSize: 14,
    opacity: 0.8,
  },
  profileName: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  profileButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  card: {
    backgroundColor: 'rgba(35, 35, 75, 0.95)',
    borderRadius: 18,
    padding: 24,
    margin: 14,
    marginTop: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 18,
    fontFamily: 'RussoOne',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#a259ff',
    fontFamily: 'RussoOne',
  },
  statLabel: {
    color: '#aaa',
    marginTop: 5,
    fontSize: 14,
  },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#444',
  },
  historyDate: {
    color: '#fff',
    flex: 2,
    fontSize: 16,
  },
  historyDuration: {
    color: '#a259ff',
    flex: 1,
    textAlign: 'center',
    fontSize: 16,
  },
  historyQuality: {
    color: '#aaa',
    flex: 1,
    textAlign: 'right',
    fontSize: 16,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: '#a259ff',
  },
  profileEmail: {
    color: '#888',
  },
  settingsList: {
    marginTop: 20,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#444',
  },
  settingText: {
    color: '#fff',
    marginLeft: 15,
    fontSize: 16,
  },
  bottomNavContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(26, 26, 46, 0.95)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
  },
  navItem: {
    alignItems: 'center',
    padding: 8,
  },
  navText: {
    color: '#fff',
    fontSize: 12,
    marginTop: 4,
  },
  navTextActive: {
    color: '#a259ff',
  },
  statsBoxContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  statBox: {
    width: '48%',
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    alignItems: 'center',
  },
  statBoxValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statBoxUnit: {
    fontSize: 16,
    opacity: 0.8,
  },
  statBoxLabel: {
    color: '#fff',
    fontSize: 14,
    opacity: 0.8,
  },
  recommendationItem: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
  },
  recommendationIcon: {
    marginRight: 12,
  },
  recommendationContent: {
    flex: 1,
  },
  recommendationTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  recommendationMessage: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
    lineHeight: 20,
  },
  addDiaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#a259ff',
    padding: 16,
    borderRadius: 12,
    marginTop: 10,
  },
  addDiaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#23234b',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  diaryForm: {
    flex: 1,
  },
  formGroup: {
    marginBottom: 20,
  },
  formLabel: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 8,
  },
  formValue: {
    color: '#fff',
    fontSize: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 12,
    borderRadius: 8,
  },
  timePickerButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 12,
    borderRadius: 8,
  },
  timePickerText: {
    color: '#fff',
    fontSize: 16,
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 12,
    borderRadius: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  optionButtonSelected: {
    backgroundColor: '#a259ff',
  },
  optionText: {
    color: '#fff',
    fontSize: 14,
  },
  moodContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  moodButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 12,
    borderRadius: 8,
    width: '18%',
    alignItems: 'center',
  },
  moodButtonSelected: {
    backgroundColor: '#a259ff',
  },
  moodText: {
    fontSize: 24,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: '#fff',
    borderRadius: 4,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSelected: {
    backgroundColor: '#a259ff',
    borderColor: '#a259ff',
  },
  checkboxLabel: {
    color: '#fff',
    fontSize: 16,
  },
  notesInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    padding: 12,
    color: '#fff',
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  saveButton: {
    backgroundColor: '#a259ff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  syncButton: {
    backgroundColor: '#a259ff',
    padding: 16,
    borderRadius: 12,
    margin: 16,
    alignItems: 'center',
  },
  syncButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  sleepSummaryCard: {
    backgroundColor: '#1f1f3b',
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 16,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  sleepCircleRow: {
    flexDirection: 'column',
    alignItems: 'center',
  },
  sleepCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 10,
    borderColor: 'rgba(162, 89, 255, 0.3)',
    backgroundColor: 'rgba(162, 89, 255, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  sleepCircleValue: {
    color: '#fff',
    fontSize: 32,
    fontWeight: 'bold',
  },
  sleepCircleLabel: {
    color: '#b8b8d0',
    fontSize: 14,
  },
  sleepCircleTarget: {
    color: '#9f9ff0',
    fontSize: 14,
    marginTop: 6,
  },
  sleepSummaryText: {
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
  },
  sleepStatus: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  sleepSubtext: {
    color: '#b8b8d0',
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
});

export default styles; 