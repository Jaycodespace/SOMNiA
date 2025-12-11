const spo2Schema = new mongoose.Schema({
  user:                 { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },

  percentage:           { type: Number, required: true, min: 0, max: 100 },

  time:                 { type: Date, required: true },

  id:                   { type: String, required: true, unique: true }, // metadata.id

  clientRecordId:       { type: String },   // metadata.clientRecordId
  clientRecordVersion:  { type: Number },   // metadata.clientRecordVersion
  dataOrigin:           { type: String },   // metadata.dataOrigin
  recordingMethod: { type: String, default: null },   // metadata.recordingMethod

  device: { type: String, default: null }, // metadata.device

  lastModifiedTime:     { type: Date, required: true }, // metadata.lastModifiedTime
}, {
  timestamps: true,
});

const SpO2 = mongoose.model('SpO2', spo2Schema);
export default SpO2;