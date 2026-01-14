import { DriverSocial, InstegramPost, TwitterPost } from '../models/socialMediaModel.js';
import {userModel} from '../models/userModel.js';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const F1_DRIVERS_SOCIAL = [
  {
    driver_number: '1',
    full_name: 'Max Verstappen',
    instagram_username: 'maxverstappen1',
    twitter_username: 'Max33Verstappen',
    team_name: 'Red Bull Racing'
  },
  {
    driver_number: '16',
    full_name: 'Charles Leclerc',
    instagram_username: 'charles_leclerc',
    twitter_username: 'Charles_Leclerc',
    team_name: 'Ferrari'
  },
  {
    driver_number: '55',
    full_name: 'Carlos Sainz Jr.',
    instagram_username: 'carlossainz55',
    twitter_username: 'Carlossainz55',
    team_name: 'Williams'  
  },
  {
    driver_number: '44',
    full_name: 'Lewis Hamilton',
    instagram_username: 'lewishamilton',
    twitter_username: 'LewisHamilton',
    team_name: 'Ferrari'
  },
  {
    driver_number: '12',
    full_name: 'Kimi Antonelli',
    instagram_username: null,
    twitter_username: null,
    team_name: 'Mercedes'
  },
  {
    driver_number: '63',
    full_name: 'George Russell',
    instagram_username: 'kimi.antonelli',
    twitter_username: 'F1KimiAntonelli',
    team_name: 'Mercedes'
  },
  {
    driver_number: '81',
    full_name: 'Oscar Piastri',
    instagram_username: 'oscarpiastri',
    twitter_username: 'OscarPiastri',
    team_name: 'McLaren'
  },
  {
    driver_number: '4',  // placeholder if needed
    full_name: 'Lando Norris',
    instagram_username: 'lando',
    twitter_username: 'LandoNorris',
    team_name: 'McLaren'
  },
  {
    driver_number: '23',
    full_name: 'Alexander Albon',
    instagram_username: 'alex_albon',
    twitter_username: 'alex_albon',
    team_name: 'Williams'
  },
  {
    driver_number: '18',
    full_name: 'Lance Stroll',
    instagram_username: 'lance_stroll',
    twitter_username: 'lance_stroll',
    team_name: 'Aston Martin'
  },
  {
    driver_number: '14',
    full_name: 'Fernando Alonso',
    instagram_username: 'fernandoalo_oficial',
    twitter_username: 'alo_oficial',
    team_name: 'Aston Martin'
  },
  {
    driver_number: '31',
    full_name: 'Esteban Ocon',
    instagram_username: 'estebanocon',
    twitter_username: 'OconEsteban',
    team_name: 'Haas'
  },
  {
    driver_number: '87',
    full_name: 'Oliver Bearman',
    instagram_username: 'olliebearman',
    twitter_username: 'OllieBearman',
    team_name: 'Haas'
  },
  {
    driver_number: '27',
    full_name: 'Nico Hülkenberg',
    instagram_username: 'hulkhulkenberg',
    twitter_username: 'HulkHulkenberg',
    team_name: 'Kick Sauber'
  },
  {
    driver_number: '5',
    full_name: 'Gabriel Bortoleto',
    instagram_username: 'gabrielbortoleto_',
    twitter_username: 'gabortoleto85',
    team_name: 'Kick Sauber'
  },
  {
    driver_number: '10',
    full_name: 'Pierre Gasly',
    instagram_username: 'pierregasly',
    twitter_username: 'PierreGASLY',
    team_name: 'Alpine'
  },
  {
    driver_number: '21',
    full_name: 'Colapinto',
    instagram_username: 'francolapinto',
    twitter_username: 'FranColapinto',
    team_name: 'Alpine'
  },
  {
    driver_number: '22',
    full_name: 'Yuki Tsunoda',
    instagram_username: 'yukitsunoda0511',
    twitter_username: 'yukitsunoda07',
    team_name: 'Red Bull Racing'
  },
  {
    driver_number: '25',
    full_name: 'Isack Hadjar',
    instagram_username: 'isackhadjar',
    twitter_username: 'Isack_Hadjar',
    team_name: 'Racing Bulls'
  },
  {
    driver_number: '77',
    full_name: 'Liam Lawson',
    instagram_username: 'liamlawson30',
    twitter_username: 'LiamLawson30',
    team_name: 'Racing Bulls'
  }
]

export const updateDriverSocials = async (res, req) => {
    try {
        console.log('Initializing driver social media update...');

        for(const driver of F1_DRIVERS_SOCIAL) {
            const result = await DriverSocial.updateOne(
                {driver_number: drivers.driver_number},
                {
                    $set: {
                        ...driver,
                        last_updated: new Date()
                    }
                },
                {upsert: true}
            );
            if(result.upsertedCount > 0) {
                insertedCount++;
            }
            else if(result.modifiedCount > 0){
                updatedCount++;
            }
            console.log(`Updated Social for Driver: ${driver.full_name}`);
        }
        res.json({
            details: {
                inserted: insertedCount, 
                updated: updateCount,
                total: F1_DRIVERS_SOCIAL.length
            }
        })
    }
    catch(error) {
        console.log('Error updating driver socials: ', error.message);
    }
}

export const getSocialWall = async (req, res) => {
    try {
        const userId = req.userId;

        const user_favorite_driver_list = await User.findById(userId).select('favorite_drivers');

        if(!user_favorite_driver_list || user_favorite_driver_list.length === 0){
            return res.json({
                message: 'No Favorite Drivers found',
                posts: []
            });
        }

        
    }
    catch(error){}
}