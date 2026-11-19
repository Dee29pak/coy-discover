import fs from 'fs';
import path from 'path';

const FILE = path.join(process.cwd(), 'data', 'db.json');
const NAMES = ['Aarav','Ananya','Kabir','Isha','Rohan','Meera','Vihaan','Diya','Arjun','Saanvi','Reyansh','Kiara','Ishaan','Myra','Dev','Anika','Yash','Tara','Neil','Riya','Kunal','Naina','Aditya','Sara','Veer','Pooja','Samar','Zoya','Harsh','Avni','Nikhil','Simran'];
const PLACES = ['GD Goenka University','Delhi University','IIT Delhi','Gurugram','Noida','Ashoka University','Jamia Millia','Amity Noida'];
const BIOS = ['Chai over coffee, always.','Will trade playlists for pizza.','Weekend trekker, weekday coder.','Probably reading or at a gig.','Dog person. Sorry, cat people.','Looking for someone to split dessert with.','Film nerd with strong opinions.','Gym at 6am, memes at 6pm.'];
const INTERESTS = ['Music','Travel','Cricket','Movies','Coding','Books','Fitness','Food','Photography','Gaming','Art','Hiking'];

function seed() {
  const profiles = NAMES.map((name, i) => ({
    id: i + 1,
    name,
    age: 19 + (i % 9),
    photo: `https://picsum.photos/seed/coy${i + 1}/480/640`,
    bio: BIOS[i % BIOS.length],
    place: PLACES[i % PLACES.length],
    interests: [0, 3, 7].map((k) => INTERESTS[(i + k) % INTERESTS.length]),
    likedMe: i % 4 === 0, // private: never leaves the server
  }));
  return { profiles, swipes: {}, matches: [] };
}

export function save(db) {
  fs.mkdirSync(path.dirname(FILE), { recursive: true });
  fs.writeFileSync(FILE, JSON.stringify(db, null, 2));
}
export function load() {
  if (!fs.existsSync(FILE)) save(seed());
  return JSON.parse(fs.readFileSync(FILE, 'utf8'));
}
export function reset() { save(seed()); }
// The ONLY shape allowed to reach the client: strips the private likedMe flag.
export const publicProfile = ({ likedMe, ...rest }) => rest;