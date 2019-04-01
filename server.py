# import datetime
from flask import Flask, request, jsonify
from flask_pymongo import PyMongo
from flask_cors import CORS
from bson.objectid import ObjectId
import datetime
import json

from chatterbot import ChatBot
from chatterbot.trainers import ListTrainer

app = Flask("__name__")
CORS(app)
app.config["MONGO_URI"] = "mongodb://localhost:27017/chatbot"
mongo = PyMongo(app)

bot = ChatBot('Test')
trainer = ListTrainer(bot)


@app.route('/getNotices', methods=['GET'])
def getNotices():
    res = mongo.db.notices.find({},{"_id":False})
    res = list(res)
    return jsonify({'success':'true', 'notices':res})

@app.route('/addNotice', methods=['POST'])
def addNotice():
    formdata = request.get_json()
    print(formdata)
    # return False
    mongo.db.notices.insert(formdata)
    return jsonify({'success':'true','message':'Notice Added Successfully!'})

@app.route("/chatbot", methods=['POST'])
def chatbot():
    question = request.get_json()
    print(question)
    response = bot.get_response(question)
    print(response)
    if len(str(response)) > 1:
        return jsonify({"success": "true", "response": str(response)})
    else:
        return jsonify({"success": "true", "response": "Hey, I didn't understand that. Can you try asking different question?"})

@app.route("/login", methods=['POST'])
def login():
    formdata = request.get_json()

    auth = mongo.db.users.find_one({'username': formdata['username'], 'password': formdata['password']})
    # print(auth)
    if auth:
        auth['_id'] = str(auth['_id'])
        return jsonify({"success": "true", "message": "Login Successfull!", "userdata":auth})
    else:
        return jsonify({"success": "false", "message": "User Not Found.!"})

@app.route('/register', methods=['POST'])
def register():
    formdata = request.get_json()
    mongo.db.users.insert(formdata)
    return jsonify({'success':'true','message':'User Created Successfully!'})

@app.route('/update', methods=['POST'])
def update():
    formdata = request.get_json()
    userid = ObjectId(formdata['_id'])
    formdata.pop('_id', None)
    mongo.db.users.update_one({'_id':userid},{"$set":formdata},upsert=False)
    return jsonify({'success':'true','message':'User Data Updated Successfully!'})

if __name__ == "__main__":
    app.run(debug=True, host='0.0.0.0', port=6969, threaded=True)
