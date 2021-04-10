from flask import Flask, render_template

app=Flask(__name__)
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
	return render_template('test.html')
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

# error handling

@app.errorhandler(404)
def handle_404(e):
	return '<center><h1>Oh No!</h1><br><p>An error 404 occured.</p></center>'
