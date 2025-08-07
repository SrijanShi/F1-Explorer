import mongoose from 'mongoose';

// const eventSchema = new mongoose.Schema({
//   timestamp: {
//     type: String, 
//     required: true
//   },
//   eventTitle: {
//     type: String,
//     required: true
//   },
//   description: {
//     type: String,
//     required: true
//   },
//   driversInvolved: {
//     type: [String],
//     default: []
//   }
// });

// const F1EventSchema = new mongoose.Schema({
//   videoId: {
//     type: String, 
//     required: true,
//     unique: true
//   },
//   events: [eventSchema]
// }, {timestamps: true});

// const F1Event = mongoose.model('F1Event', F1EventSchema);


const F1HighlightSchema = new mongoose.Schema({
  videoId: {
    type: String, 
    required: true,
    unique: true
  },
  title: {
    type: String, 
    required: true
  },
  publishedAt: {
    type: Date, 
    required: true
  }
}, {timestamps: true});

const F1Video = mongoose.model('F1Video', F1HighlightSchema);

const F1VideoDetailSchema = new mongoose.Schema({
  videoId: {
    type: String, 
    required: true,
    unique: true
  },
  title: {
    type: String,
    required: true
  },
  publishedAt: {
    type: Date,
    required: true
  },
  thumbnailUrl: {
    type: String,
  },
  transcript: [
    {
        text: String,
        start: Number,
        duration: Number
    }
  ],
  viewCount: {
    type: Number,
    default: 0
  },
  likeCount: {
    type: Number,
    default: 0
  },
  duration: {
    type: String
  },
  events: [{
    time: String,
    description: String,
    drivers: [String]
  }]
}, {timestamps: true});

const F1VideoDetail = mongoose.model('F1VideoDetail', F1VideoDetailSchema);

export {F1VideoDetail, F1Video};
