import PIL.Image, PIL.ImageTk
import time
import math
from tkinter import *
from tkinter import filedialog

# stylesheet
buttonStylesheet = {
	"bg" : "#c9c9c9",
	"relief" : "flat",
	"activebackground" : "#b0b0b0",
	"font" : ("Calibri", 15)
}

# gui setup
root = Tk()
root.geometry("400x300+100+100")
root.title("MapDesigner v0.0.1")

# checkbutton and radiobutton vars
advancedLogging = IntVar()

# funcs

def openFile():
	root.fileName = filedialog.askopenfilename(initialdir = "C:/Users/wangh/Documents/Jerry/python/flask", title = "Open Image",
		filetypes = ((
		"JPG Files", "*.jpg"), ("PNG Files", "*.png"), ("BMP Files", "*.bmp"), ("All Files", "*")))
	if root.fileName: # chose a file
		uploadButtonBig.destroy()
		previewImg = PIL.Image.open(root.fileName)
		previewImg = previewImg.resize((root.winfo_width() - 30, root.winfo_height() - 50), PIL.Image.ANTIALIAS)

		previewImgTk = PIL.ImageTk.PhotoImage(previewImg)

		previewLabel.config(image = previewImgTk)
		previewLabel.image = previewImgTk

		# pack frames
		root.geometry("400x600+100+100")
		imgPreviewFrame.pack(padx = 5, pady = 5)
		imgOptionsFrame.pack(padx = 5, pady = 5)

def goBack():
	pass

# bohhh why cant like keys() just return a list already
def getKeys(d):
	res = []
	for key in d.keys():
		res.append(key)
	return tuple(res)

def processImg(img):
	im = PIL.Image.open(img) # Can be many different formats.
	pixs = im.getdata()
	width = im.size[0]
	height = im.size[1]
	numOfPixs = width * height
	logs = []
	advancedLogs = []

	colorsIncomplete = {}
	pixColors = {}
	finalList = ""


	for pix in range(0, numOfPixs):
		currentPos = [pix % width, math.floor(pix / height)]
		currentColor = pixs[pix]


		if (len(currentColor) == 4 and currentColor[3] != 0) or currentColor[0] != 255 and currentColor[1] != 255 and currentColor[2] != 255: # so it's not transparent
			advancedLogs.append(
				f"[ADVANCEDLOGS]: non-transparent pixel found. coords: {currentPos}, color: {currentColor}\n")

			if currentColor in getKeys(colorsIncomplete): # so the color has already occured
				colorsIncomplete[currentColor].append(currentPos)
				advancedLogs.append(
					f"[ADVANCEDLOGS]: non-transparent pixel of the same color {currentColor} has already occured\n")

				if len(colorsIncomplete[currentColor]) == 4: # 4 of the same color occured, ready to spit out a wall
					poses = colorsIncomplete[currentColor]
					print("wall ready. poses=" + repr(poses))
					wallX = poses[0][0]
					wallY = poses[0][1]
					wallWidth = poses[1][0] - wallX + 1
					wallHeight = poses[2][1] - wallY + 1
					advancedLogs.append(
						f"[ADVANCEDLOGS]: wall ready. wallX = {wallX}, wallY = {wallY}, wall\
						Width = {wallWidth}, wallHeight = {wallHeight}\n")
					finalList += "[{}, {}, {}, {}],\n".format(
						wallX, wallY, wallWidth, wallHeight)

					del colorsIncomplete[currentColor]

			else: # so the color is new
				colorsIncomplete[currentColor] = [currentPos]
				advancedLogs.append("[ADVANCEDLOGS]: non-transparent pixel color was new\n")
	root.finalList = finalList
	if advancedLogging:
		root.advancedLogs = advancedLogs
		logsText.insert(1.0, root.advancedLogs)
	logsText.configure(state = "disabled")
	root.logs = logs
	resFrame.pack()
	print(finalList)
	

# Buttons and other w's

# Upload File
uploadButtonBig = Button(root, text = "Upload a File", width = 1000, height = 1000, command = openFile,
	**buttonStylesheet)
uploadButtonBig.pack(padx = 10, pady = 10)

# After Image Selected
imgPreviewFrame = LabelFrame(root, text = "Preview", padx = 10, pady = 10)
previewLabel = Label(imgPreviewFrame)
previewLabel.grid(row = 0, column = 0, rowspan = 5, columnspan = 5)
okButton = Button(imgPreviewFrame, text = "Ok", command = lambda: processImg(root.fileName), **buttonStylesheet)
okButton.grid(row = 6, column = 1)
cancelButton = Button(imgPreviewFrame, text = "Cancel", command = goBack, **buttonStylesheet)
cancelButton.grid(row = 6, column = 4)

imgOptionsFrame = LabelFrame(root, text = "Options", padx = 10, pady = 10)
advancedLoggingCheck = Checkbutton(imgOptionsFrame, variable = advancedLogging, text = "Advanced Logging",
	onvalue = 1, offvalue = 0)
advancedLoggingCheck.pack()

# after processed
resFrame = LabelFrame(root, text = "Results", padx = 10, pady = 10)
logsLabel = Label(resFrame, text = "Logs")
logsLabel.pack(padx = 10, pady = 5)
logsText = Text(resFrame, height = 10, font = ("Calibri", 11))
logsText.pack()


root.mainloop()
