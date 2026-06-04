import {Kafka, Producer, Admin} from 'kafkajs';
import dotenv from 'dotenv';

dotenv.config();

let producer : Producer;
let admin : Admin;

type messageType = {
    to : string;
    subject : string;
    html : string;
}


export const connectKafka = async() => {
    try{
        const kafka = new Kafka({
            clientId : "auth-service",
            brokers : [process.env.KAFKA_BROKERS as string || "localhost:9092"]
        });

        admin = kafka.admin();
        await admin.connect();

        const topics = await admin.listTopics();

        if(!topics.includes("send-mail")){
            await admin.createTopics({
                topics : [{topic : "send-mail", numPartitions : 1, replicationFactor : 1}]
            })
        }

        await admin.disconnect();

        producer = kafka.producer();
        await producer.connect();
        console.log("Producer connected");
        
    }catch(error){
        console.log("Failed to start producer", error);
    }
}

export const publishToTopic = async(topic : string, message : messageType)=> {
    if(!producer){
        console.log("Producer not initialized");
        return;
    }
    try{
        await producer.send({
            topic,
            messages : [{value : JSON.stringify(message)}]
        })
        console.log("Message sent to topic", topic);
    }catch(error){
        console.log("Failed to send message to topic", error);
    }
}

export const disconnectKafka = async() => {
    if(producer){
        await producer.disconnect();
    }
}



