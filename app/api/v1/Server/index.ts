import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors'; // Import cors package
import "dotenv/config";
import env from "../../../utils/validateEnv.ts";
 import User from '../../../(models)/user.ts';
// import Details from "../../../(models)/details.ts";
import { NextResponse, NextRequest } from "next/server";
import dbConnect from "../../../utils/dbConnect.ts";
import { jwtDecode } from "jwt-decode";
import verifyToken from "../../../utils/helperFunctions/verifyToken.ts";
// import Friendship from "@/app/(models)/friendship.ts";
import sanitizeData from "../../../utils/helperFunctions/sanitizeData.ts";
import { messageZodSchema,wallZodSchema,commentZodSchema } from "../../../utils/helperFunctions/zodSchemas.ts"
import Chat from '../../../(models)/chat.ts';
import mongoose, { ObjectId } from 'mongoose';
import {Wall,Comment} from '../../../(models)/wall.ts';
import { uploadToS3 } from '../../../utils/helperFunctions/s3ImgUpload.ts';
import { v4 as uuidv4 } from "uuid";



interface DecodedToken {
    id: string;
    email: string;
    username:string;
}

const server = http.createServer((req, res) => {
  // Handle HTTP requests if needed
});

// Enable CORS for WebSocket server


const io = new Server(server, {
    cors: {
        origin:'http://localhost:3000',
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    }
});
// io.on('request', cors());
io.on('connection', (socket) => {
  console.log('A user connected',socket.id);

  // Handle chat messages
  socket.on('joinChat',({chatId,userId}) => {
    socket.join(chatId);
   // socket.userId=userId;
    console.log('hoi')
    console.log(`${userId} joined chat ${chatId}`)
  })
  
  socket.on('joinWall', ({ userId }) => {
    console.log(userId)
    socket.join(`wall_${userId}`);
    console.log(`${userId} joined their wall room`);
  });

  // socket.on('get-message',async ({message,currentChatId,token}) => {
  //   console.log(message)


  //   const verifiedToken = verifyToken(token);
   
  //   if (!verifiedToken) {
  //       console.log('unverified')
  //     return; 
  //     //NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  //   } //verify token 

  //   await dbConnect(); // Ensure database connection
  //   const decodedToken = jwtDecode(verifiedToken) as DecodedToken; //extract token
  //   const chat = await Chat.findById(currentChatId)
  //   console.log(decodedToken)
  //   if (!chat) {
  //       return;
  //       //NextResponse.json({ message: "Chat not found" }, { status: 404 });
  //   } // find chat or return 
  //   //console.log({message:message});
  //   const senderObjectId = new mongoose.Types.ObjectId(decodedToken.id);
  //   let validation;
  //   let sanitizedData;
  //   let newMessage;
  //   if(message.message !== '') {
  //   validation = messageZodSchema.safeParse(message);
    
  //   if (!validation.success) {
  //       console.log(validation.error)
  //     return;
  //     //NextResponse.json(validation.error.errors, { status: 400 });
  //   }
    
  //   sanitizedData = sanitizeData(validation); 

  //   if (!sanitizedData) {
  //     return;
  //   } 
  //  }
  //   if(chat.messages.length === 0) {
  //       for (const participantId of chat.participants) {
  //           if (participantId.toString() !== decodedToken.id) {
  //               const user = await User.findById(participantId);
  //               if (user) {
  //                   user.chats.push(chat._id);
  //                   await user.save();
  //               }
  //           }
  //       }
  //   }
    
  //   if(message.message !== '') {
  //   newMessage = {
  //       sender: senderObjectId ,
  //       content: sanitizedData?.message as string,
  //       createdAt: new Date(),
  //   } //make sure to modify after creation and add user name to sender 
  //   chat.messages.push(newMessage);
  //   await chat.save();
  //  } else {
  //   newMessage = {
  //     sender: senderObjectId ,
  //     createdAt: new Date(),
  //   }  //make sure to modify after creation and add user name to sender 
  //   chat.messages.push(newMessage);
  //   await chat.save();
  // }
  //   const imgLink = message.image ? await uploadToS3(message.image,'chatImages',uuidv4()) : undefined;
  //   console.log(imgLink);
  //   chat.messages[chat.messages.length-1].image = imgLink;
  //   await chat.save();
  //   const newlySavedMessage = {
  //      // _id:chat.messages[chat.messages.length-1]._id,
  //       sender: {_id:senderObjectId.toString(),username:decodedToken.username},
  //       content: sanitizedData?.message as string,
  //       createdAt: chat.messages[chat.messages.length-1].createdAt,
  //       image:imgLink,
  //   }
    
  //  // console.log(username)
  //   io.to(currentChatId).emit('get-message', newlySavedMessage,currentChatId); // Broadcast the message to all connected clients
  // });
  socket.on('get-message', async ({ message, currentChatId, token }) => {
    console.log(message);
  
    const verifiedToken = verifyToken(token);
    if (!verifiedToken) {
      console.log('unverified');
      return; //Unauthorized
    }
  
    await dbConnect(); // Ensure database connection
    const decodedToken = jwtDecode(verifiedToken) as DecodedToken; //extract token
    const chat = await Chat.findById(currentChatId);
    console.log(decodedToken);
    if (!chat) {
      return; // Chat not found
    }
  
    const senderObjectId = new mongoose.Types.ObjectId(decodedToken.id);
    let validation;
    let sanitizedData;
    let newMessage: any = {
      sender: senderObjectId,
      createdAt: new Date(),
    };
  
    if (message.message !== '') {
      validation = messageZodSchema.safeParse(message);
      if (!validation.success) {
        console.log(validation.error);
        return; // Bad Request
      }
      sanitizedData = sanitizeData(validation);
      if (!sanitizedData) {
        return;
      }
      newMessage.content = sanitizedData.message as string;
    }
  
    if (chat.messages.length === 0) {
      for (const participantId of chat.participants) {
        if (participantId.toString() !== decodedToken.id) {
          const user = await User.findById(participantId);
          if (user) {
            user.chats.push(chat._id);
            await user.save();
          }
        }
      }
    }
  
    if (message.image) {
    
      const imgLink = await uploadToS3(message.image, 'chatImages', uuidv4());
      newMessage.image = imgLink;
    }
  
    chat.messages.push(newMessage);
    await chat.save();
  
    const newlySavedMessage = {
      sender: { _id: senderObjectId.toString(), username: decodedToken.username },
      content: newMessage.content || '',
      createdAt: newMessage.createdAt,
      image: newMessage.image || '',
    };
  
    io.to(currentChatId).emit('get-message', newlySavedMessage, currentChatId); // Broadcast the message to all connected clients
  });
  
  socket.on('create-wallPost', async ({imageURL,wallId,token}) => {

    const verifiedToken = verifyToken(token);
    console.log(imageURL);
    if (!verifiedToken) {
        console.log('unverified')
      return; 
    } 

    await dbConnect(); // Ensure database connection
    const decodedToken = jwtDecode(verifiedToken) as DecodedToken; //extract token

    const user = await User.findById(decodedToken.id);

    if(!user){
        return;
    }
    // let validation;
    // let sanitizedData;
    // if (newPostContent.post !== '') {
    //   validation = wallZodSchema.safeParse(newPostContent);
      
    //   if (!validation.success) {
    //     console.log(validation.error)
    //     return;
    //   }
      
    //   sanitizedData = sanitizeData(validation); 
    // // console.log(sanitizedData.newPostContent);
    //   if (!sanitizedData) {
    //     return;
    //   } 
    // }

    // let newWall = new Wall({
    //     user:decodedToken.id,
    //     content:sanitizedData?.post || '',
    // })
    
  // await newWall.save();

  
  const wall = await Wall.findById(wallId);
  
  if(!wall) {
    return;
  }

  if(imageURL) {
   wall.image=imageURL;
   await wall.save();
  }


    const wallPost  = {
        _id:wall._id,
        user:{_id:user?.id,username:user?.username,profilePic: user.profilePic},
        content:wall.content,
        replies:wall.replies,
        createdAt:wall.createdAt,
        likes:wall.replies,
        image:wall.image || null,
    }

    console.log(decodedToken.id)
    io.to(`wall_${decodedToken.id}`).emit('create-wallPost', wallPost);
    const friends = user.friends; // Assuming user has a friends field which is an array of user IDs
    friends.forEach(friendId => {
        io.to(`wall_${friendId}`).emit('create-wallPost', wallPost);
    });
  })

  socket.on('create-comment', async ({imageURL,comment,wallId,token}) => {
    console.log('hi')
    console.log(comment,wallId,imageURL);
    const verifiedToken = verifyToken(token);

    if (!verifiedToken) {
      console.log('unverified')
      return; 
    } 

    await dbConnect(); // Ensure database connection
    const decodedToken = jwtDecode(verifiedToken) as DecodedToken; //extract token

    const user = await User.findById(decodedToken.id);

    if(!user){
        return;
    }

    const wall = await Wall.findById(wallId).populate('replies');
    
    if(!wall) {
        return; 
    }
     //const reply = wall.replies._id(comment._id);
   console.log(wall);
    if(imageURL) {
      wall.replies.map((reply) => {
        if(reply._id.toString() === comment._id.toString())
          reply.image = imageURL;
          
      })
      await wall.save();
    }

    // wall.replies.push(comment);
    // await wall.save();
    const commentToClient = {  //new comment object to be added to the specified post
      _id:comment._id, 
      sender: {_id: user?.id,username:user?.username, profilePic:user?.profilePic},
      message: comment.message, //the text in the comment input field for the specific postId 
      time: comment.time,
      image:imageURL || null,
    };  
 
    io.to(`wall_${decodedToken.id}`).emit('create-comment', wallId,commentToClient,user?.id);
    const friends = user.friends; // Assuming user has a friends field which is an array of user IDs
    friends.forEach(friendId => {
        io.to(`wall_${friendId}`).emit('create-comment',wallId,commentToClient,user?.id);
    });
  })

  socket.on('delete-comment', async ({ wallId, commentId, token }) => {
    console.log(wallId, commentId);
    const verifiedToken = verifyToken(token);
  
    if (!verifiedToken) {
      console.log('unverified');
      return;
    }
  
    await dbConnect(); // Ensure database connection
    const decodedToken = jwtDecode(verifiedToken) as DecodedToken; // Extract token
    const user = await User.findById(decodedToken.id);
  
    if (!user) {
      return;
    }
  
    const wall = await Wall.findById(wallId);
  
    if (!wall) {
      return;
    }
  
    const isOwnerOrCommenter = wall.user.equals(user._id.toString()) || wall.replies.some(reply => reply.sender.equals(user._id.toString()));
  
    if (isOwnerOrCommenter) {
      wall.replies = wall.replies.filter((reply) => reply._id.toString() !== commentId);
      await wall.save();

      io.to(`wall_${decodedToken.id}`).emit('delete-comment',commentId);
      user.friends.forEach(friendId => {
        io.to(`wall_${friendId}`).emit('delete-comment',commentId);
      });
    } else {
      console.log('Unauthorized delete attempt');
    }
  });
  
  socket.on('delete-wallPost', async ({wallId,token}) => {
    console.log(wallId);
    const verifiedToken = verifyToken(token);
  
    if (!verifiedToken) {
      console.log('unverified');
      return;
    }
  
    await dbConnect(); // Ensure database connection
    const decodedToken = jwtDecode(verifiedToken) as DecodedToken; // Extract token
    const user = await User.findById(decodedToken.id);
  
    if (!user) {
      return;
    }
    
    const wall = await Wall.findById(wallId);
    
    if (!wall || wall.user.toString() !== user?.id ) {
      return;
    }
    
    await Wall.findByIdAndDelete(wallId);

    io.to(`wall_${decodedToken.id}`).emit('delete-wallPost', wallId);
    const friends = user.friends; // Assuming user has a friends field which is an array of user IDs
    friends.forEach(friendId => {
        io.to(`wall_${friendId}`).emit('delete-wallPost', wallId);
    });
  })

  socket.on('toggle-like', async ({action,wallId,token}) => {
    console.log(action, wallId);
    const verifiedToken = verifyToken(token);
  
    if (!verifiedToken) {
      console.log('unverified');
      return;
    }
  
    await dbConnect(); // Ensure database connection
    const decodedToken = jwtDecode(verifiedToken) as DecodedToken; // Extract token
    const user = await User.findById(decodedToken.id);
  
    if (!user) {
      return;
    }
    const wall = await Wall.findById(wallId);

    if (!wall) {
        return;
    }
    if(action === 'add') {
        const alreadyLiked = wall.likes.some(id => id === user._id);
        if (alreadyLiked) {
          return;
        }
        wall.likes.push(user._id);
        await wall.save();
    } else if (action === 'remove'){
        const hasLiked = wall.likes.some(id => id.toString() === user._id.toString());
        if (!hasLiked) {
        return;
        }
        const newWall = wall.likes.filter(id => id.toString() !== user._id.toString() )
        wall.likes = newWall;
        await wall.save();
    }

    io.to(`wall_${decodedToken.id}`).emit('toggle-like', action,wallId,user._id,user.username);
    const friends = user.friends; // Assuming user has a friends field which is an array of user IDs
    friends.forEach(friendId => {
        io.to(`wall_${friendId}`).emit('toggle-like', action,wallId,user._id,user.username);
    });
  })

  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
});

server.listen(3001, () => {
  console.log('WebSocket server listening on port 3001');
});
