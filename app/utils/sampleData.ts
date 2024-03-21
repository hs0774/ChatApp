import 'dotenv/config';
import env from './validateEnv.ts'
import mongoose from 'mongoose';
import * as fs from 'fs';
import {faker} from '@faker-js/faker'
import bcrypt from 'bcryptjs';
// import Chat from '../(models)/chat.ts';
// import Details from '../(models)/details.ts';
// import Friendship from '../(models)/friendship.ts';
// import Inbox from '../(models)/inbox.ts';
// import User from '../(models)/user.ts';



// interface IChat {
//     participants: mongoose.Types.ObjectId[];
//     messages: {
//       sender: mongoose.Types.ObjectId;
//       content: string;
//       timestamp: Date;
//     }[];
// }
interface IDetails {
    hobbies: string[];
    job: string;
    interests:string;
    bio: string;
    age: number;
    sex: 'male' | 'female' | 'other';
    location?: string;
}

interface IFriendship {
    user: mongoose.Types.ObjectId;
    friend: mongoose.Types.ObjectId;
    status: 'pending' | 'accepted' | 'declined';
    createdAt: Date;
}

interface IInbox {
    user: mongoose.Types.ObjectId;
    message: string;
    type: 'message' | 'friendRequest'; 
    read: boolean;
    createdAt: Date;
}

// interface IMessage {
//     sender: mongoose.Types.ObjectId;
//     receiver: mongoose.Types.ObjectId;
//     content: string;
//     createdAt: Date;
// }

interface IUser {
    username: string;
    password: string; 
    email: string; 
    details: mongoose.Types.ObjectId;
    profilePic: Buffer; 
    friends: mongoose.Types.ObjectId[]; 
    chats: mongoose.Types.ObjectId[]; 
    status: boolean; 
    inbox: mongoose.Types.ObjectId[]; 
    nonFriendsChat: boolean; 
}

interface IMessage extends Document {
    sender: mongoose.Types.ObjectId;
    content: string;
    image?:Buffer;
    createdAt: Date;
}

interface IChat extends Document {
    participants: mongoose.Types.ObjectId[];
    messages: IMessage[]; 
}

console.log('This script populates some test items to your database');

const mongoDB = env.MONGODB_URI;

main().catch((err) => console.log(err));

async function main() {
    console.log("Debug: About to connect");
    await mongoose.connect(mongoDB);
    // await updateUserFriends();
   //await chatCreate();
    // await createDetails();
    // await createFriendship();
    // await createInbox();
    // await messageCreate();
    // await createUser();
    // await updateFriends();
    console.log("Debug: Closing Mongoose");
    mongoose.connection.close();
}

// async function updateFriends() {
//     const [user1, user2] = await Promise.all([
//         User.findOne({ username: "Dovie9" }),
//         User.findOne({ username: "Winifred16" }),
//     ]);

//     if(user1 && user2) {
//         user1.friends.push(user2._id);
//         await user1.save();
//         user2.friends.push(user1._id);
//         await user2.save();
//     }
// }
// async function updateUserFriends() {
//     const friendships = [
//         [],       
//         [9, 3, 7],     
//         [8, 2],     
//         [7],         
//         [6],          
//         [5, 7],        
//         [4, 6, 2],     
//         [3],           
//         [2],          
//         [],            
//     ] //relationships between users but in 1 so will do -1 to zero index

//     const users = await User.find();

//     for (let i =0;i<users.length;i++){
//         users[i].friends = friendships[i].map((id) => users[id-1]._id);
//         await users[i].save();
//     }
// }

// async function chatCreate() {
//     const user = await User.find();

//     const chats = [
//         {participants:[user[1],user[8],user[6]]},
//         {participants:[user[2],user[7]]},
//         {participants:[user[2],user[1]]},
//         {participants:[user[3],user[6]]},
//         {participants:[user[4],user[5]]},
//     ]

//     for (const chat of chats) {
//         const {participants} = chat;

//         const newChat = new Chat({
//             participants:participants,
//         })

//         await newChat.save();

//         for (const user of participants) {
//             user.chats.push(newChat._id);
//             await user.save();
//         }
//     }

// }


// async function detailsCreate(hobbies:string[],job:string,interests:string,bio:string,age:number,sex:string,location:string) {
//     try {
//         const newDetails = new Details({
//             hobbies: hobbies,
//             job: job,
//             interests: interests,
//             bio: bio,
//             age: age,
//             sex: sex,
//             location: location,
//         })
//         await newDetails.save();
//         console.log('added details')

//         const user = await User.findOne({ details: { $exists: false } });
//         if(user){
//             user.details = newDetails._id;
//             await user.save();
//             console.log('Assigned details to user:', user.username);
//         } else {
//             console.log('No user found without details');
//         }
//     } catch(error) {
//         console.error(error + 'something went wrong');
//     }
// }


// async function messageCreate() {
//     const chats = await Chat.find();

//     for (const chat of chats) {
//         const {participants} = chat;
//         for(let i=0;i<30;i++){
//             const randomSenderIndex = Math.floor(Math.random() * participants.length);
//             const randomSender = participants[randomSenderIndex];

//             const newMessage = {
//                 sender: randomSender,
//                 content: faker.lorem.sentence(), // Generate random content using faker
//                 createdAt: new Date(),
//             };

//             // Add the new message to the chat's messages array
//             chat.messages.push(newMessage);

//         }
//         await chat.save();
//     }
// }

// async function userCreate(index:number,username:string,email:string,password:string,profilePic:Buffer) {
//    //details,friends,chats,inbox left unfilled on purpose
//    //status,nonfriendschat left to schema default,
//    const user = new User({
//         username: username,
//         password: password,
//         email: email,
//         profilePic: profilePic,
//    })
//    await user.save();
//    console.log('added user' + username)
// }


// async function createDetails() {
//     console.log('creating details');
//     for (let i=0;i<10;i++){
//         await detailsCreate([faker.lorem.word(),faker.lorem.word(),faker.lorem.word()],faker.person.jobTitle(),
//         faker.lorem.words(10),faker.person.bio(),faker.number.int({ min: 18, max: 65 }),faker.person.sex(),faker.location.country())
//     }
// }

// async function createFriendship() {
//     const users = await User.find();

//     for (const user of users) {
//         for (const friend of user.friends) {
//             const friendship = await Friendship.findOne({
//                 $or: [
//                     { user: user._id, user2: friend },
//                     { user: friend, user2: user._id }
//                 ]
//             });

//             if (!friendship) {
//                 const newFriendship = new Friendship({
//                     user: user._id,
//                     user2: friend,
//                     status: 'accepted',
//                 });
//                 await newFriendship.save();
//             }
//         }
//     }
// }


// async function createInbox() {
//     const user = await User.find();
//     const inbox = [
//         {sender:user[1],receiver:user[3],message:faker.lorem.words(10),type:'message'},
//         {sender:user[3],receiver:user[5],message:faker.lorem.words(10),type:'message'},
//         {sender:user[4],receiver:user[2],message:faker.lorem.words(10),type:'message'},
//         {sender:user[1],receiver:user[3],message:`${user[1].username} has sent you a friend request`,type:'friendRequest'},
//         {sender:user[8],receiver:user[2],message:`${user[3].username} has sent you a friend request`,type:'friendRequest'},
//         {sender:user[4],receiver:user[6],message:`${user[4].username} has sent you a friend request`,type:'friendRequest'},
//     ]

//     for(const item of inbox) {
//        const {sender,receiver,message,type} = item;

//        const inboxQuery = new Inbox({
//         sender: sender._id,
//         receiver: receiver._id,
//         message: message,
//         type: type,
//        })
//        await inboxQuery.save();
//        if(type ==='friendRequest') {
//         const newFriendship = new Friendship({
//                 user: sender._id,
//                 user2: receiver._id,
//                 status: 'pending',
//             });
//             await newFriendship.save();         
//        }
//        receiver.inbox.push(inboxQuery._id);
//        await receiver.save();
//     }
// }


// async function createUser() {
//     console.log('creating users');
//     for(let i=0;i<10;i++){  
//         const password = `password${i}`;
//         const hash = await bcrypt.hash(password, 10);
//         const avatarUrl = faker.image.avatar(); // Get the avatar image URL from Faker.js
//         // Download the image from the URL and convert it to a buffer
//         const avatarBuffer = await downloadImageToBuffer(avatarUrl);
//         if(avatarBuffer){
//         await userCreate(i,faker.internet.userName(),faker.internet.email(),hash,avatarBuffer)
//         } else {
//             console.log('failed')
//         }
//     }
// }

// async function downloadImageToBuffer(imageUrl:string) {
//     try {
//         const response = await fetch(imageUrl);
//         if (!response.ok) {
//             throw new Error(`Failed to download image (${response.status} ${response.statusText})`);
//         }
//         const buffer = await response.arrayBuffer();
//         return Buffer.from(buffer);
//     } catch (error) {
//         console.error('Error downloading image:', error);
//         return null;
//     }
// }


//quick note on how to get ts/node to compile this run "node --loader ts-node/esm sampleData.ts"
// and make sure all files are named properly like user.ts detail.ts etc 
