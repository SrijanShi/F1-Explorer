// import axios from 'axios';
// import { TwitterUser, Tweet } from '../models/twitterModel.js';
// import dotenv from 'dotenv';

// dotenv.config();

// const TWITTER_BEARER_TOKEN = process.env.TWITTER_BEARER_TOKEN;

// const tweetCache = {
//     tweets: [],
//     lastFetched: null,
//     currentIndex: 0,
//     isFetching: false
// };

// const DRIVER_TEAM_HANDLES = [
//     alo_oficial,
//     LewisHamilton,
//     HulkHulkenberg,
//     Max33Verstappen,
//     Carlossainz55,
//     OconEsteban,
//     lance_stroll,
//     Charles_Leclerc,
//     LandoNorris,
//     GeorgeRussell63,
//     alex_albon,
//     yukitsunoda07,
//     OscarPiastri,
//     jackdoohan33,
//     LiamLawson30,
//     OllieBearman,
//     Isack_Hadjar,
//     gabortoleto85,
//     PierreGASLY,
//     McLarenF1,
//     ScuderiaFerrari,
//     redbullracing,
//     MercedesAMGF1,
//     WilliamsRacing,
//     AstonMartinF1,
//     HaasF1Team,
//     AlpineF1Team,
//     visacashapprb
// ];


// export const initializeTwitterUsers = async (req, res) => {
//     try {
//         if(!TWITTER_BEARER_TOKEN) {
//             return res.status(500).json({ message: 'Twitter Bearer Token not set' });
//         }
//         const usersToFetch = [];

//         for(const username of DRIVER_TEAM_HANDLES) {
//             const existingUser = await TwitterUser.findOne({ username });

//             const oneWeek = new Date(Date.now()-7*24*60*60*1000);
//             if(!existingUset || existingUser.lastFetched < oneWeek) {
//                 usersToFetch.push(username);
//             }

//             if(usersToFetch.length === 0) {
//                 const allUsers = await TwitterUser.find({ username: { $in: DRIVER_TEAM_HANDLES } });
//                 return res.json({
//                     message: 'All Twitter users are up to date',
//                     users: allUsers
//                 });
//             }
            
//             const userBatches = [];
//             for(let i = 0; i < usersToFetch.length; i += 30) {
//                 userBatches.push(usersToFetch.slice(i, i + 30));
//             }
//             const updateUsers = [];

//             for(const batch of userBatches) {
//                 const usernames = batch.join(',');
//                 const response = await axios.get(
//                     'https://api.twitter.com/2/users/by', {
//                       params: {
//                         usernames,
//                         'user.fields': 'profile_image_url,name'
//                       },
//                       headers: {
//                         'Authorization': `Bearer ${TWITTER_BEARER_TOKEN}`
//                       }
//                     }
//                 );
//                 if(response.data.data){
//                     for(const user of response.data.data) {
//                         /racing|F1Team|Ferrari|Mercedes|Bull|McLaren|Alpine|Aston|Haas|Williams|visa/i.test(user.username) ? 'team' : 'driver';

//                         const updatedUser = await TwitterUser.findOneAndUpdate( { username: user.username },
//                             {
//                                 username: user.username,
//                                 userId: user.id,
//                                 displayName: user.name,
//                                 profileImageUrl: user.profile_image_url,
//                                 category,
//                                 lastUpdated: new Date()
//                             },
//                             { updert: true, new: true }
//                         );
//                         updateUsers.push(updatedUser);
//                     }
//                 }
//             }

//             res.json({
//                 message: `U[dated ${updatedUsers.length} Twitter users`,
//                 users: updateUsers
//             })
//         }
//     }
//     catch (error) {
//         console.error('Error initializing Twitter users:', error);
//         res.status(500).json({ 
//         message: 'Error initializing Twitter users', 
//         error: error.message,
//         details: error.response?.data
//         });
//     }
// };

// export const fetchRecentTweets = async(req, res) => {
//     try {
//         if(!TWITTER_BEARER_TOKEN) {
//             return res.status(500).json({ message: 'Twitter Bearer Token not set' });
//         }
//         const twitterUsers = await TwitterUser.find({});

//         if(twitterUsers.length === 0) {
//             return res.status(404).json({ message: 'No users available' });
//         }

//         let newTweetsCount = 0;
//         let updatedTweetsCount = 0;

//         for(let i = 0; i < twitterUsers.length; i += 3)
//     }
// }