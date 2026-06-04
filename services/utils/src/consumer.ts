import {Kafka} from 'kafkajs';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

export const startMailConsumer = async() => {
    try{
        const kafka = new Kafka({
            clientId : "mail-service",
            brokers : [process.env.KAFKA_BROKERS as string || "localhost:9092"]
        })

        const consumer = kafka.consumer({groupId : "mail-service-group"});

        await consumer.connect();

        await consumer.subscribe({topic : "send-mail", fromBeginning : false});

        await consumer.run({
            eachMessage : async({topic, partition, message}) => {
              console.log('Message received', message.value?.toString());

               try {
                const {to, subject, html} = JSON.parse(message.value?.toString() as string || "{}");
                const transporter = nodemailer.createTransport({
                    host : process.env.SMTP_HOST,
                    port : Number(process.env.SMTP_PORT),
                    secure : true,
                    auth : {
                        user : process.env.SMTP_USER,
                        pass : process.env.SMTP_PASS
                    }
                });

                await transporter.sendMail({
                    from : `Hireheaven <no-reply@hireheaven.com>`,
                    to,
                    subject,
                    html,
                })

                console.log("Mail sent successfully to", to);
                
               } catch (error) {
                console.log("Error sending mail", error);
               }
            }
        })
    }catch(error){
        console.log("failed to start kafka consumer", error);
    }
}