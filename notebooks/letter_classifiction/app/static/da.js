const size = 784;
const styles = {
  canvas: {
    border: '1px solid #333',
    margin: '20px 0px'
  },
  maindiv: {
    padding: '10px',
    margin: 'auto',
    width: '800px'
  },
  colorSwatches: {
    red: {
      'backgroundColor': 'red'
    },
    orange: {
      'backgroundColor': 'orange'
    },
    yellow: {
      'backgroundColor': 'yellow'
    },
    green: {
      'backgroundColor': 'green'
    },
    blue: {
      'backgroundColor': 'blue'
    },
    purple: {
      'backgroundColor': 'purple'
    },
    black: {
      'backgroundColor': 'black'
    }
  } //simple draw component made in react

};

class DrawApp extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    this.reset();
  }

  draw(e) {
    //response to Draw button click
    this.setState({
      mode: 'draw'
    });
  }

  erase() {
    //response to Erase button click
    this.setState({
      mode: 'erase'
    });
  }

  export() {
    const out = [];

    for (var i = 0; i < 28; i += 1) {
      out.push(new Array(28));
    }

    var drawing = this.refs.canvas;
    var con = drawing.getContext("2d");
    var imgData = con.getImageData(0, 0, size, size);

    for (var row = 0; row < size; row++) {
      for (var col = 0; col < size; col++) {
        var row_bucket = Math.floor(row / 28);
        var col_bucket = Math.floor(col / 28);
        out[row_bucket][col_bucket] = out[row_bucket][col_bucket] || 0; //find current pixel

        var index = (col + row * imgData.width) * 4; //separate into color values

        var r = imgData.data[index];
        var g = imgData.data[index + 1];
        var b = imgData.data[index + 2];

        if (r < 255 || g < 255 || b < 255) {
          out[row_bucket][col_bucket] = 1;
        }
      }
    }

    return out;
  }

  drawing(e) {
    //if the pen is down in the canvas, draw/erase
    if (this.state.pen === 'down') {
      this.ctx.beginPath();
      this.ctx.lineWidth = this.state.lineWidth;
      this.ctx.lineCap = 'round';

      if (this.state.mode === 'draw') {
        this.ctx.strokeStyle = this.state.penColor;
      }

      if (this.state.mode === 'erase') {
        this.ctx.strokeStyle = '#ffffff';
      }

      this.ctx.moveTo(this.state.penCoords[0], this.state.penCoords[1]); //move to old position

      this.ctx.lineTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY); //draw to new position

      this.ctx.stroke();
      this.setState({
        //save new position
        penCoords: [e.nativeEvent.offsetX, e.nativeEvent.offsetY]
      });
    }
  }

  penDown(e) {
    //mouse is down on the canvas
    this.setState({
      pen: 'down',
      penCoords: [e.nativeEvent.offsetX, e.nativeEvent.offsetY]
    });
  }

  penUp() {
    //mouse is up on the canvas
    this.setState({
      pen: 'up'
    });
    this.request();
  }

  request() {
    var that = this;
    var exported = this.export();

    if (window.xhr) {
      window.xhr.abort();
    }

    this.setState({
      data: null
    });
    var newData = [];

    for (var i = 0; i < exported.length; i++) {
      var row = [];

      for (var j = 0; j < exported.length; j++) {
        row.push([exported[i][j]]);
      }

      newData.push(row);
    }

    ;
    window.xhr = $.ajax({
      url: '/predict',
      type: 'POST',
      data: JSON.stringify(newData),
      datatype: "json",
      contentType: "application/json",
      success: function (res) {
        that.setState({
          data: JSON.parse(res)
        });
      },
      error: function (res) {
        that.setState({
          data: "<error unable to predict>"
        });
      }
    });
  }

  setColor(c) {
    //a color button was clicked
    this.setState({
      penColor: c
    });
  }

  reset() {
    //clears it to all white, resets state to original
    this.setState({
      mode: 'draw',
      pen: 'up',
      lineWidth: 30,
      penColor: 'black'
    });
    this.ctx = this.refs.canvas.getContext('2d');
    this.ctx.fillStyle = "white";
    this.ctx.fillRect(0, 0, size, size);
    this.ctx.lineWidth = 30;
  }

  render() {
    return React.createElement("div", {
      style: styles.maindiv
    }, React.createElement("h3", null, "Draw a letter. ", this.state.data && `Is your guess ${this.state.data}?`), React.createElement("canvas", {
      ref: "canvas",
      width: size,
      height: size,
      style: styles.canvas,
      onMouseMove: e => this.drawing(e),
      onMouseDown: e => this.penDown(e),
      onMouseUp: e => this.penUp(e)
    }), React.createElement("div", null, React.createElement("button", {
      onClick: e => this.draw(e),
      style: (styles.btn, styles.button)
    }, "Draw"), React.createElement("button", {
      onClick: e => this.erase(e),
      style: (styles.btn, styles.button)
    }, "Erase"), React.createElement("button", {
      onClick: () => this.reset(),
      style: (styles.btn, styles.button)
    }, "Reset")));
  }

}

window.DrawApp = DrawApp;

