const express = require('express');
const { MongoClient } = require('mongodb');
const path = require('path');

const app = express();
const port = 3000;

// JSON body 파싱
app.use(express.json());

// public 폴더를 정적 파일 제공
app.use(express.static('public'));

// MongoDB 연결
const uri = "mongodb+srv://admin1234:<db_password>@cluster0.zab9dwo.mongodb.net/test?retryWrites=true&w=majority";
const client = new MongoClient(uri);

async function run() {
    try {
        await client.connect();
        console.log("MongoDB 연결 성공!");
        const database = client.db('test');
        const collection = database.collection('example');

        // 데이터 가져오기
        app.get('/api/data', async (req, res) => {
            const data = await collection.find({}).toArray();
            res.json(data);
        });

        // 데이터 추가
        app.post('/api/data', async (req, res) => {
            const doc = req.body;
            const result = await collection.insertOne(doc);
            res.json(result);
        });

        // 서버 실행
        app.listen(port, () => {
            console.log(`Server running at http://localhost:${port}`);
        });

    } catch (err) {
        console.error(err);
    }
}

run();
