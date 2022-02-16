from flask import Flask, render_template, request
import json, time, sys
from flask_socketio import SocketIO, emit
global scores
scores = {}


app=Flask(__name__)
socketio = SocketIO(app)
# app.config['STATIC_FOLDER'] = 'static'
# app.config['static_url_path'.upper()] ='/static'

@app.route('/')
def index():
	return "<h1 title='heloe worlde'>Hello World!!</h1>"

@app.route('/user/<name>')
def user(name):
	return '<h1 title="{}">hello {}</h1>'.format(name, name)

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

@app.route('/dungeoncrawler')
def dungeoncrawler():
	return render_template('dungeon_crawler.html')

@app.route('/trajectory')
def trajectory():
	return render_template('trajectory.html')

@app.route('/surprise')
def vaxBad():
	return render_template('rick.html')

@app.route('/game')
def game():
	return render_template('mammalgame.html')

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

@app.route("/postScores")
def postScores():
	name = request.args.get("name")
	score = request.args.get("score")
	scores[score] = name
	f = open("leader.txt", "w")
	f.write(json.dumps(scores))
	f.close()
	return "ok sir"

@app.route("/leaderboard")
def leader():
	leader_string = ""
	f = open("leader.txt", "r")
	x = json.loads(f.read())
	f.close()
	keys_x = list(x.keys())
	for y in range(0, len(keys_x)): # turn em to floats
		keys_x[y] = float(keys_x[y])

	for z in keys_x:
		leader_string += f"{x[str(z)]}"
	return render_template("leaderboard.html", leader_string = leader_string)

@app.route("/zombiewars")
def zombiewars():
	return render_template("zombiewars.html", rand_num = time.time())

@app.route("/lmao/you/cant/see/this/ehe")
def lmao():
	f = open("leader.txt", "r")
	x = f.read()
	f.close()
	return x

@socketio.on("message")
def handleMsg(texts):
	emit("sendBackLmoa", texts, broadcast=True)
	print(texts)
	sys.stdout.flush()

# error handling

@app.errorhandler(404)
def handle_404(e):
	return '<center><h1>Oh No!</h1><br><p>An error 404 occured.</p></center>'

if __name__ == "__main__":
	socketio.run(app)