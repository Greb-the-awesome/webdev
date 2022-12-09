from flask import Flask, render_template, request
import json, time, sys
from flask_socketio import SocketIO, emit
import threading
# from replit import db
from functools import cmp_to_key
global scores, foolz
scores = {}
foolz = 0


app=Flask(__name__)
socketio = SocketIO(app)
# app.config['STATIC_FOLDER'] = 'static'
# app.config['static_url_path'.upper()] ='/static'

@app.route('/fw')
def index():
	return "<h1 title='heloe worlde'>Hello World!!</h1>"

@app.route('/test')
def test():
	return render_template('newtest.html')
	#please donnot render js in this!!

@app.route('/fwoosh')
def fwoosh():
	return render_template('htmlclass.html')

@app.route('/zombiegame')
def zombiegame():
	return render_template('zombiegame.html')

@app.route('/multiplayer3dgame')
def multiplayer3dgame():
	return render_template('multiplayer_3d_game.html')

@app.route('/trajectory')
def trajectory():
	return render_template('trajectory.html')

@app.route('/tetris')
def game():
	return render_template('mammalgame.html')

# TOPS stuff

@app.route('/sthaboutjerry')
def sthAboutJerry():
	return render_template('applications.html')

@app.route('/sthaboutjerry/labpics')
def labpics():
	return render_template('subfolders/lab_pics.html')

@app.route('/sthaboutjerry/animations')
def animations():
	return render_template('subfolders/animations.html')

@app.route('/sthaboutjerry/piano')
def piano():
	return render_template('subfolders/piano.html')

@app.route('/sthaboutjerry/sports')
def sports():
	return render_template('subfolders/sports.html')

@app.route("/postscore/")
def postScores():
	name = request.args.get("n")
	score = request.args.get("s")
	db[name] = int(score)
	print(name, score)
	sys.stdout.flush()
	return "ok sir"

def compareTuple(a, b):
	if a[0] < b[0]:
		return -1
	elif a[0] > b[0]:
		return 1
	return 0

@app.route("/leaderboard")
def leader():
	leader_list = []
	k = db.keys()
	v = []
	for x in k:
		v.append((x, db[x]))
	v.sort(key=cmp_to_key(compareTuple))
	place = 2
	for x in v:
		leader_list.append(str(place) + "th place: " + x[0] + " " + str(x[1]))
		place += 1
	return render_template("leaderboard.html", leader_string = leader_list)

@app.route("/resetLeaderboard/<a>")
def resetLeaderboard(a):
	if hash(a) == 7851914160732287839:
		for x in db.keys():
			del db[x]
	return "leaderboard reset"

@app.route("/zombiewars")
def zombiewars():
	return render_template("zombiewars.html", rand_num = time.time())

@app.route("/zombiewars3d")
def zombiewars3d():
	return render_template("zombiewars3d.html", rand_num = time.time())

# sockets

@socketio.on("message")
def handleMsg(texts):
	emit("sendBackLmoa", texts, broadcast=True)
	print(texts)
	sys.stdout.flush()

# error handling

@app.errorhandler(404)
def handle_404(e):
	return '<center><h1>Oh No!</h1><br><p>An error 404 occured.</p></center>'

socketio.run(app)
