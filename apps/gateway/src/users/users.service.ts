import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { User, UserDocument } from "./user.schema";
import { Model } from "mongoose";

@Injectable()
export class UsersService {
    constructor(
        @InjectModel(User.name) private readonly userModel: Model<UserDocument >
    ){}

    async upsertAuthUser(
        input : {
            clerkUserId: string;
            email : string;
            name: string;
        }
    ){
        const now = new Date();

        return this.userModel.findOneAndUpdate(
            {
                clerkUserId : input.clerkUserId
            },
            {
                //this basically updates the input field with the new details filled out
                $set: {
                    email: input.email,
                    name: input.name,
                    lastSeenAt: now
                },
                $setOnInsert : {
                    role : 'user'
                }
            }, 
            {
                returnDocument: 'after',
                upsert:true,
                setDefaultsOnInsert: true
            }
        )
    }


    async findByClerkUserId(clerkUserId: string){
        return this.userModel.findOne({clerkUserId})
    }
} 