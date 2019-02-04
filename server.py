# import datetime
from flask import Flask, request, jsonify
from flask_pymongo import PyMongo
from flask_cors import CORS
from bson.objectid import ObjectId
import datetime
import pandas as pd
import json
from pandas import ExcelWriter

app = Flask("__name__")
CORS(app)
app.config["MONGO_URI"] = "mongodb://localhost:27017/chatbot"
mongo = PyMongo(app)


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

@app.route('/catlist', methods=['POST'])
def catlist():
    res = mongo.db.categories.find({},{"_id":False})
    res = list(res)
    return jsonify({'success':'true', 'catlist':res})

@app.route('/subcatlist', methods=['POST'])
def subcatlist():
    res = mongo.db.subCategories.find({},{"_id":False})
    res = list(res)
    return jsonify({'success':'true', 'subcatlist':res})

@app.route('/addsubcat', methods=['POST'])
def addsubcat():
    formdata = request.get_json()
    mongo.db.subCategories.insert(formdata)
    return jsonify({'success':'true','message':'SubCategory Added Successfully!'})

@app.route('/addServiceProvider', methods=['POST'])
def addServiceProvider():
    formdata = request.get_json()
    today = datetime.date.today()
    print(today)
    mongo.db.serviceProviders.insert({'fname':formdata['fname'],'mname':formdata['mname'], 'lname':formdata['lname'],
    'catId':formdata['cat']['ID'],'email':formdata['email'],'contact':formdata['mobNo'],'contact2':formdata['mobNo2'],
    'aadhar':formdata['aadhar'],'address':formdata['address'], 'password':formdata['pwd'], 'regDate':str(today), 'status': 'active'})
    return jsonify({'success':'true','message':'Service Provider Added Successfully!'})

@app.route('/getSPList', methods=['POST'])
def getSPList():
    res = mongo.db.serviceProviders.find({})
    res = list(res)
    for x in res:
        x["_id"] = str(x["_id"])
    return jsonify({'success':'true','spList':res})

@app.route('/getCount', methods=['POST'])
def getCount():
    count = {}
    count['catcount'] = mongo.db.categories.find({}).count()
    return jsonify({'success':'true','count':count})


#Update Functions
@app.route('/updateSP', methods=['POST'])
def updateSP():
    formdata = request.get_json()
    formid = ObjectId(formdata['_id'])
    formdata.pop('$$hashKey', None)
    formdata.pop('_id', None)
    mongo.db.serviceProviders.update_one({'_id':formid},{"$set":formdata},upsert=False)
    return jsonify({'success':'true','message':'Service Provider Updated Successfully!'})

@app.route('/updateSubCat', methods=['POST'])
def updateSubCat():
    formdata = request.get_json()
    formdata.pop('$$hashKey', None)
    mongo.db.subCategories.update_one({'catId':formdata['catId']},{"$set":formdata},upsert=False)
    return jsonify({'success':'true','message':'Sub Category Updated Successfully!'})

#Delete Functions
@app.route('/deleteSP', methods=['POST'])
def deleteSP():
    _id = ObjectId(request.get_json()['_id'])
    mongo.db.serviceProviders.remove({'_id':_id})
    return jsonify({'success':'true','message':'Service Provider Deleted Successfully!'})

if __name__ == "__main__":
    app.run(debug=True, host='0.0.0.0', port=6969, threaded=True)
