(function() {
	"use strict";
	var UserInterface = function() {
		this.fileSelect = document.getElementById('image_select');
		this.linkSelect = document.getElementById('link_image_select');
		this.textSelect = document.getElementById('image_select_text');
		this.linkRun = document.getElementById('image_run');
		this.linkCancel = document.getElementById('image_cancel');
		this.threshold = document.getElementById('threshold');
		this.preview = document.getElementById('preview');
		this.colorList = document.getElementById('color_list');
		document.addEventListener('keydown', this._listenerKeyboard = this.listenerKeyboard.bind(this));
		this.fileSelect.addEventListener('change', this._listenerFileSelect = this.listenerFileSelect.bind(this));
		this.allowSelectFile = false;
		this.flagEnableSelect = false;
		this.flagEnableRun = false;
		this.flagEnableCancel = false;
		this._listeners = {};
	};
	UserInterface.prototype.listenerKeyboard = function(event) {
		if(event.keyCode === 79 && event.ctrlKey && !event.shiftKey && !event.metaKey && !event.altKey) {
			if(!this.allowSelectFile) {
				return;
			}
			event.preventDefault();
			this.onRequestFileOpen(event);
		}
	};
	UserInterface.prototype.listenerLinkSelect = function(event) {
		if(event.target !== this.linkSelect) {
			return;
		}
		event.preventDefault();
		this.onRequestFileOpen(event);
	};
	UserInterface.prototype.listenerFileSelect = function(event) {
		event.preventDefault();
		if(!this.allowSelectFile) {
			this.fileSelect.value = '';
			return;
		}
		if(this.fileSelect.files[0] instanceof File) {
			this.textSelect.classList.remove('empty');
			this.textSelect.textContent = this.fileSelect.files[0].name;
			var file = this.fileSelect.files[0];
			if (this._listeners['open'] instanceof Array) {
				this._listeners['open'].forEach(function (listener) {
					listener(file);
				});
			}
		}
	};
	UserInterface.prototype.listenerLinkRun = function(event) {
		event.preventDefault();
		if (this._listeners['run'] instanceof Array) {
			this._listeners['run'].forEach(function (listener) {
				listener();
			});
		}
	};
	UserInterface.prototype.listenerLinkCancel = function(event) {
		event.preventDefault();
		if (this._listeners['cancel'] instanceof Array) {
			this._listeners['cancel'].forEach(function (listener) {
				listener();
			});
		}
	};
	UserInterface.prototype.listenerResize = function(event) {
		var image = this.preview.getElementsByTagName('img')[0];
		if((image instanceof Image) || (image instanceof HTMLImageElement)) {
			if(image.baseWidth > this.preview.clientWidth || image.baseHeight > this.preview.clientHeight) {
				var iar = image.baseWidth / image.baseHeight;
				var par = this.preview.clientWidth / this.preview.clientHeight;
				if(iar > par) {
					image.width = this.preview.clientWidth;
					image.height = image.width / iar;
				} else {
					image.height = this.preview.clientHeight;
					image.width = image.height * iar;
				}
			}
		}
	};
	UserInterface.prototype.on = UserInterface.prototype.addEventListener = function(event, listener) {
		if (typeof(listener) !== 'function') {
			throw new TypeError('Only functions can be added as listeners.');
		}
		if (!(this._listeners[event] instanceof Array)) {
			this._listeners[event] = [listener];
		} else if (this.listeners[event].indexOf(listener) === -1) {
			this._listeners[event].push(listener);
		}
		return this;
	};
	UserInterface.prototype.off = UserInterface.prototype.removeEventListener = function(event, listener) {
		if (typeof(listener) !== 'function') {
			return;
		}
		if (this._listeners[event] instanceof Array) {
			var index = this._listeners[event].indexOf(listener);
			if (index !== -1) {
				this._listeners[event].splice(index, 1);
			}
			if (this._listeners[event].length === 0) {
				delete this._listeners[event];
			}
		}
		return this;
	};
	UserInterface.prototype.removeAllListeners = function(event) {
		delete this._listeners[event];
		return this;
	};
	UserInterface.prototype.onRequestFileOpen = function(event) {
		var event = new MouseEvent('click', {
			'button': '0',
			'canBubble': true,
			'cancelable': true,
			'view': window
		});
		this.fileSelect.dispatchEvent(event);
	};
	UserInterface.prototype.enableFileSelection = function() {
		if(this.flagEnableSelect) {
			return;
		}
		this.flagEnableSelect = true;
		this.linkSelect.classList.remove('disabled');
		this.linkSelect.addEventListener('click', this._listenerLinkSelect = this.listenerLinkSelect.bind(this));
		this.allowSelectFile = true;
		this.fileSelect.disabled = false;
	};
	UserInterface.prototype.disableFileSelection = function() {
		if(!this.flagEnableSelect) {
			return;
		}
		this.flagEnableSelect = false;
		this.fileSelect.disabled = true;
		this.allowSelectFile = false;
		if(this._listenerLinkSelect) {
			this.linkSelect.removeEventListener('click', this._listenerLinkSelect);
			this._listenerLinkSelect = null;
		}
		this.linkSelect.classList.add('disabled');
	};
	UserInterface.prototype.enableRun = function() {
		if(this.flagEnableRun) {
			return;
		}
		this.flagEnableRun = true;
		this.linkRun.classList.remove('disabled');
		this.linkRun.addEventListener('click', this._listenerLinkRun = this.listenerLinkRun.bind(this));
	};
	UserInterface.prototype.disableRun = function() {
		if(!this.flagEnableRun) {
			return;
		}
		this.flagEnableRun = false;
		if(this._listenerLinkRun) {
			this.linkRun.removeEventListener('click', this._listenerLinkRun);
		}
		this.linkRun.classList.add('disabled');
	};
	UserInterface.prototype.enableCancel = function() {
		if(this.flagEnableCancel) {
			return;
		}
		this.flagEnableCancel = true;
		this.linkCancel.classList.remove('disabled');
		this.linkCancel.addEventListener('click', this._listenerLinkCancel = this.listenerLinkCancel.bind(this));
	};
	UserInterface.prototype.disableCancel = function() {
		if(!this.flagEnableCancel) {
			return;
		}
		this.flagEnableCancel = false;
		if(this._listenerLinkCancel) {
			this.linkCancel.removeEventListener('click', this._listenerLinkCancel);
		}
		this.linkCancel.classList.add('disabled');
	};
	UserInterface.prototype.showProgress = function(preserve) {
		var loading = this.colorList.getElementsByClassName('loading')[0];
		var progress = this.colorList.getElementsByClassName('progress')[0];
		if(loading instanceof Element) {
			loading.style.display = 'block';
		}
		if(progress instanceof Element) {
			if(!preserve) {
				progress.style.width = '0%';
			}
			progress.style.display = 'block';
		}
	};
	UserInterface.prototype.hideProgress = function() {
		var loading = this.colorList.getElementsByClassName('loading')[0];
		var progress = this.colorList.getElementsByClassName('progress')[0];
		if(loading instanceof Element) {
			loading.style.display = 'none';
		}
		if(progress instanceof Element) {
			progress.style.display = 'none';
		}
	};
	UserInterface.prototype.updateProgress = function(percent) {
		this.showProgress(true);
		var progress = this.colorList.getElementsByClassName('progress')[0];
		if(progress instanceof Element) {
			progress.style.width = Math.round(percent) + '%';
		}
	};
	UserInterface.prototype.showPreviewNone = function() {
		var description = this.preview.getElementsByClassName('description')[0],
			error = this.preview.getElementsByClassName('error')[0],
			image = this.preview.getElementsByClassName('content')[0];
		this.preview.getElementsByClassName('description')[0].style.display = 'block';
		this.preview.getElementsByClassName('error')[0].style.display = 'none';
		var img = this.preview.getElementsByTagName('img')[0];
		if(img instanceof Image) {
			this.preview.removeChild(img);
		}
		if(this._listenerResize) {
			window.removeEventListener('resize', this._listenerResize);
		}
	};
	UserInterface.prototype.showPreviewError = function(message) {
		this.preview.getElementsByClassName('description')[0].style.display = 'none';
		var err = this.preview.getElementsByClassName('error')[0];
		err.style.display = 'block';
		err.getElementsByClassName('message')[0].textContent = message;
		var img = this.preview.getElementsByTagName('img')[0];
		if(img instanceof Image) {
			this.preview.removeChild(img);
		}
		if(this._listenerResize) {
			window.removeEventListener('resize', this._listenerResize);
		}
	};
	UserInterface.prototype.showPreviewImage = function(image) {
		this.preview.getElementsByClassName('description')[0].style.display = 'none';
		this.preview.getElementsByClassName('error')[0].style.display = 'none';
		var img = this.preview.getElementsByTagName('img');
		for(var i = 0; i < img.length; ++i) {
			this.preview.removeChild(img.item(i));
		}
		img = image.cloneNode(true);
		img.width = img.baseWidth = image.width;
		img.height = img.baseHeight = image.height;
		img.classList.add('content');
		if(img.width > this.preview.clientWidth || img.height > this.preview.clientHeight) {
			var iar = img.width / img.height;
			var par = this.preview.clientWidth / this.preview.clientHeight;
			if(iar > par) {
				img.width = this.preview.clientWidth;
				img.height = img.width / iar;
			} else {
				img.height = this.preview.clientHeight;
				img.width = img.height * iar;
			}
		}
		this.preview.appendChild(img);
		window.addEventListener('resize', this._listenerResize = this.listenerResize.bind(this));
	};
	UserInterface.prototype.getThreshold = function() {
		var value = parseInt(this.threshold.value);
		if(isNaN(value)) {
			return null;
		}
		if(value < 1) {
			return 1;
		} else if(value > 255) {
			return 255;
		} else {
			return value;
		}
	};
	UserInterface.prototype.setThreshold = function(threshold) {
		this.threshold.value = String(threshold);
	};
	UserInterface.prototype.enableThreshold = function() {
		this.threshold.disabled = false;
	};
	UserInterface.prototype.disableThreshold = function() {
		this.threshold.disabled = true;
	};
	UserInterface.prototype.clearColors = function() {
		var table = document.getElementById('color_table'), row = table.rows[0];
		while(row.cells.length > 0) {
			row.deleteCell(0);
		}
	};
	UserInterface.prototype.addColors = function(colors, length) {
		var table = document.getElementById('color_table'), row = table.rows[0];
		colors.forEach(function(color) {
			var cell = row.insertCell();
			var div = document.createElement('div');
			cell.classList.add('color-cell');
			div.classList.add('color');
			div.style.backgroundColor = 'rgb(' + Math.round(color[0]) + ',' + Math.round(color[1]) + ',' + Math.round(color[2]) + ')';
			var tableText = document.createElement('table');
			var textRow = tableText.insertRow();
			var textCell = textRow.insertCell();
			var colorCount = document.createElement('div');
;			var colorPercent = document.createElement('div');
			tableText.classList.add('text');
			colorCount.classList.add('color-count');
			colorPercent.classList.add('color-percent');
			colorCount.textContent = color.count + ' / ' + length;
			colorPercent.textContent = (Math.round(color.percentage * 10000) / 100) + '%';
			textCell.appendChild(colorCount);
			textCell.appendChild(colorPercent);
			div.appendChild(tableText);
			cell.appendChild(div);
		});
	};
	var ImageController = function(userInterface) {
		this.userInterface = userInterface;
		this.allowSelectFile = false;
		this.allowRunImage = false;
		this.allowCancelImage = false;
		userInterface.addEventListener('open', this._listenerOpen = this.listenerOpen.bind(this));
		userInterface.addEventListener('run', this._listenerRun = this.listenerRun.bind(this));
		userInterface.addEventListener('cancel', this._listenerCancel = this.listenerCancel.bind(this));
	};
	ImageController.prototype.listenerOpen = function(file) {
		this.userInterface.disableFileSelection();
		this._image = new Image();
		var uri = URL.createObjectURL(file);
		this._image.addEventListener('load', this._listenerImageLoad = this.listenerImageLoad.bind(this));
		this._image.addEventListener('error', this._listenerImageError = this.listenerImageError.bind(this));
		this._image.src = uri;
	};
	ImageController.prototype.listenerRun = function() {
		if(!(this._image instanceof Image)) {
			return;
		}
		var canvas = document.createElement('canvas');
		var context = canvas.getContext('2d');
		var image = this._image;
		canvas.width = image.width;
		canvas.height = image.height;
		context.drawImage(image, 0, 0);
		var imageData = context.getImageData(0, 0, canvas.width, canvas.height);
		var threshold = this.userInterface.getThreshold();
		if(!threshold) {
			this.userInterface.setThreshold(threshold = 48);
		} else {
			this.userInterface.setThreshold(threshold);
			if(threshold < 16) {
				if(!confirm('Threshold lower than 16 will run long time\nand return too many colors, causing page to crush.\nAre you sure you want to continue.')) {
					return;
				}
			}
		}
		this.getWorker().postMessage({'op': 'colors', 'threshold': threshold, 'buffer': imageData.data.buffer}, [imageData.data.buffer]);
		this.threadThreshold = threshold;
		this.threadLength = imageData.data.length;
		this.userInterface.enableCancel();
		this.userInterface.disableRun();
		this.userInterface.disableFileSelection();
		this.userInterface.disableThreshold();
		this.userInterface.clearColors();
		this.userInterface.showProgress();
	};
	ImageController.prototype.listenerCancel = function() {
		this.terminate();
		this.userInterface.hideProgress();
	};
	ImageController.prototype.terminate = function() {
		if(this._worker instanceof Worker) {
			this.threadThreshold = null;
			this.threadLength = null;
			this._worker.terminate();
			this._worker = null;
			this.userInterface.disableCancel();
			this.userInterface.enableRun();
			this.userInterface.enableFileSelection();
			this.userInterface.enableThreshold();
		}
	};
	ImageController.prototype.getWorker = function() {
		if(!(this._worker instanceof Worker)) {
			this._worker = new Worker('/javascripts/thread_colors.js');
			this._worker.addEventListener('message', this._listenerWorkerMessage = this.listenerWorkerMessage.bind(this));
		}
		return this._worker;
	};
	ImageController.prototype.listenerImageLoad = function(event) {
		if(this._listenerImageLoad) {
			this._image.removeEventListener('load', this._listenerImageLoad);
		}
		if(this._listenerImageError) {
			this._image.removeEventListener('error', this._listenerImageError);
		}
		if(!(this._image instanceof Image)) {
			return;
		}
		this.userInterface.showPreviewImage(this._image);
		this.userInterface.enableFileSelection();
		this.userInterface.enableRun();
		this.userInterface.disableCancel();
		this.userInterface.clearColors();
	};
	ImageController.prototype.listenerImageError = function(event) {
		if(this._listenerImageLoad) {
			this._image.removeEventListener('load', this._listenerImageLoad);
		}
		if(this._listenerImageError) {
			this._image.removeEventListener('error', this._listenerImageError);
		}
		userInterface.showPreviewError('Unable to load image. Source either not available or is not an image.');
		this.userInterface.enableFileSelection();
	};
	ImageController.prototype.listenerWorkerMessage = function(event) {
		if(!event.data.response) {
			return;
		}
		if(event.data.response === 'op') {
			if(event.data.op === 'terminate') {
				this.terminate();
			}
		} else if(event.data.response === 'colors') {
			this.userInterface.hideProgress();
			this.userInterface.clearColors();
			this.userInterface.addColors(event.data.colors, event.data.length);
			this.terminate();
		} else if(event.data.response === 'progress') {
			if(event.data.progress === 'image') {
				this.userInterface.updateProgress((event.data.read / event.data.length) * 50);
			} else if(event.data.progress === 'initialize') {
				this.userInterface.updateProgress(50);
				this.threadLength = event.data.length;
			} else if(event.data.progress === 'iteration') {
				this.userInterface.updateProgress(50 + ((Math.pow(2, 1 - event.data.updateDistance / this.threadThreshold) - 1) * 50));
			}
		}
	};
	document.addEventListener("DOMContentLoaded", function() {
		var userInterface = new UserInterface();
		var imageController = new ImageController(userInterface);
		userInterface.showPreviewNone();
		userInterface.enableFileSelection();
	});
})();