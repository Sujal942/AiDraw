import "./Canvas.css";
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css"; // Import Bootstrap CSS
import { Navbar, Nav, Container } from "react-bootstrap"; // Import Navbar components
import DraggableDiv from "./DraggableDiv";

const DrawCanvas = ({ onImageReady }) => {
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);
  let [isDrawing, setisDrawing] = useState(false);
  let [BrushSize, setBrushSize] = useState(2);
  let [ChangeColor, setChangeColor] = useState("#121111");
  const [analysisResult, setAnalysisResult] = useState(null);

  const [isColorPickerVisible, setIsColorPickerVisible] = useState(false);
  const toggleColorPickerVisibility = () => {
    setIsColorPickerVisible(!isColorPickerVisible);
  };

  const [isSliderVisible, setIsSliderVisible] = useState(false);
  const toggleSliderVisibility = () => {
    setIsSliderVisible(!isSliderVisible);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    canvas.width = window.innerWidth * 0.9;
    canvas.height = window.innerHeight * 0.8;

    ctx.lineCap = "round";
    ctx.strokeStyle = ChangeColor;
    ctx.lineWidth = BrushSize;
    ctxRef.current = ctx;

    const updateCanvasSize = () => {
      canvas.width = window.innerWidth * 0.9;
      canvas.height = window.innerHeight * 0.8;

      ctxRef.current = ctx;
      ctx.lineCap = "round";
      ctx.strokeStyle = ChangeColor;
      ctx.lineWidth = BrushSize;
    };

    window.addEventListener("resize", updateCanvasSize);
    return () => {
      window.removeEventListener("resize", updateCanvasSize);
    };
  }, []);

  const startdrawing = ({ nativeEvent }) => {
    document.body.style.overflow = "none";
    const { offsetX, offsetY } = getEventPosition(nativeEvent);
    ctxRef.current.beginPath();
    ctxRef.current.moveTo(offsetX, offsetY);
    ctxRef.current.lineTo(offsetX, offsetY);
    ctxRef.current.stroke();
    setisDrawing(true);
    nativeEvent.preventDefault();
  };
  const draw = ({ nativeEvent }) => {
    //console.log("d")
    if (!isDrawing) {
      return;
    }
    const { offsetX, offsetY } = getEventPosition(nativeEvent);
    ctxRef.current.lineTo(offsetX, offsetY);
    ctxRef.current.stroke();
    nativeEvent.preventDefault();
    setIsSliderVisible(false);
    setIsColorPickerVisible(false);
  };
  const stopdrawing = () => {
    //console.log("Nd")
    ctxRef.current.closePath();
    setisDrawing(false);
    document.body.style.overflow = "auto";
  };

  //////////////Adding GetEventPosition Function for handle both mouse and touch response.
  const getEventPosition = (nativeEvent) => {
    if (nativeEvent.touches) {
      // For touch events, use `clientX` and `clientY` of the first touch
      const touch = nativeEvent.touches[0];
      const { left, top } = nativeEvent.target.getBoundingClientRect();
      return {
        offsetX: touch.clientX - left,
        offsetY: touch.clientY - top,
      };
    } else {
      // For mouse events, use `offsetX` and `offsetY`
      return {
        offsetX: nativeEvent.offsetX,
        offsetY: nativeEvent.offsetY,
      };
    }
  };
  /////////////////////////////////////////////

  const setToDraw = () => {
    ctxRef.current.globalCompositeOperation = "source-over"; //uper draw ke liye
  };
  const setToErase = () => {
    ctxRef.current.globalCompositeOperation = "destination-out";
  };
  const DownloadCanvasImage = (event) => {
    let link = event.currentTarget;
    link.setAttribute("download", "canvas.png");
    canvasRef.current.toDataURL("image/png"); //
    let image = canvasRef.current.toDataURL("image/png");
    link.setAttribute("href", image);
  };

  const setToReset = () => {
    ctxRef.current.clearRect(
      0,
      0,
      canvasRef.current.width,
      canvasRef.current.height
    );
    setAnalysisResult(null);
  };

  const setTohandleBrushSize = (event) => {
    const size = event.target.value;
    setBrushSize(size);
    ctxRef.current.lineWidth = size;
  };
  const setToChangeColor = (event) => {
    const color = event.target.value;
    if (color === "#000000") {
      setChangeColor("#121111");
      ctxRef.current.strokeStyle = "#121111"; //Update canvas stroke color to Selected
    } else {
      setChangeColor(color);
      ctxRef.current.strokeStyle = color;
    }
  };

  const webService = async (event) => {
    event.preventDefault();
    const canvasImage = canvasRef.current;
    if (!canvasImage) return;

    const dataURL = canvasImage.toDataURL("image/png");
    //console.log(dataURL);

    //Send DataURL to Backend
    try {
      const response = await axios.post(
        "https://ai-draw-backend-7xtw.onrender.com/analyze",
        {
          dataURL,
        }
      );
      setAnalysisResult(response.data.analysisResult);
    } catch (err) {
      console.log(err);
    }

    if (onImageReady) {
      onImageReady(dataURL); // Pass the base64 string to a parent component if needed
    }
    //Send DataURL to Backend
  };

  return (
    <div>
      {/* Navbar */}
      <Navbar
        style={{ backgroundColor: "#15292E", fontSize: "1.2rem" }}
        variant="dark"
        className="mb-4"
      >
        <Container>
          <Navbar.Brand
            href="#home"
            className="fw-medium titleof"
            style={{
              fontSize: "1.5rem",
              display: "flex",
              alignItems: "center",
            }}
          >
            {/* Logo image */}
            <img
              src="/AiDraw.png"
              alt="Ai Draw Logo"
              style={{
                width: "50px",
                height: "50px",
                borderRadius: "50%",
                marginRight: "1px",
                padding: "3px",
              }}
            />
            <span>Ai Draw</span>
          </Navbar.Brand>

          <Nav className="ms-0 navbar-responsive">
            {" "}
            {/* ms-0 aligns the nav to the left */}
            <div className="tooltip-wrap">
              <Nav.Link href="#draw">
                <button
                  onClick={setToDraw}
                  type="button"
                  className="btn btn-outline-primary btn-sm"
                >
                  <i className="fa-solid fa-pencil"></i>
                </button>
              </Nav.Link>
              <div className="tooltip-content">Draw </div>
            </div>
            <div className="tooltip-wrap">
              <Nav.Link href="#erase">
                <button
                  onClick={setToErase}
                  type="button"
                  className="btn btn-outline-warning btn-sm"
                >
                  <i className="fa-solid fa-eraser"></i>
                </button>
              </Nav.Link>
              <div className="tooltip-content">Erase</div>
            </div>
            <Nav.Link href="#reset">
              <button
                onClick={setToReset}
                type="button"
                className="btn btn-outline-danger btn-sm"
              >
                Reset
              </button>
            </Nav.Link>
            <div className="tooltip-wrap">
              <Nav.Link href="#download">
                <a
                  id="downloadimage"
                  href="image/png"
                  onClick={DownloadCanvasImage}
                  className="btn btn-outline-info btn-sm"
                >
                  <i className="fa-solid fa-file-arrow-down"></i>
                </a>
              </Nav.Link>
              <div className="tooltip-content">Save</div>
            </div>
            <Nav.Link href="#upload">
              <form method="POST">
                <button
                  onClick={webService}
                  type="button"
                  className="solverbutton btn btn-success btn-sm"
                >
                  Solve <i className="fa-solid fa-play"></i>
                </button>
              </form>
            </Nav.Link>
          </Nav>
        </Container>
      </Navbar>

      <div className="d-flex justify-content-center align-items-center">
        <canvas
          id="canvas"
          ref={canvasRef}
          onMouseDown={startdrawing}
          onMouseUp={stopdrawing}
          onMouseMove={draw}
          onMouseLeave={stopdrawing}
          //For Mobile Functionality
          onTouchStart={startdrawing}
          onTouchMove={draw}
          onTouchEnd={stopdrawing}
          ///////
          className="border border-3 border-primary rounded-lg shadow-lg"
        />
      </div>

      <div className="d-flex justify-content-center flex-wrap ">
        <div className="brush-control">
          <button
            className="btn btn-primary rounded-circle"
            onClick={toggleSliderVisibility}
          >
            <img height="30px" width="30px" src="/paintbrush.png" />
          </button>
          {isSliderVisible && (
            <input
              type="range"
              min="1"
              max="20"
              value={BrushSize}
              onChange={setTohandleBrushSize}
              className="brush-size-slider"
            />
          )}
        </div>

        <div className="color-control">
          <button
            className="btn btn-primary rounded-circle"
            onClick={toggleColorPickerVisibility}
          >
            <i
              className="fa-solid fa-palette"
              style={{ fontSize: "1.5rem", color: "white" }}
            ></i>
          </button>
          {isColorPickerVisible && (
            <div className="tooltip-wrap1">
              <input
                type="color"
                value={ChangeColor}
                onChange={setToChangeColor}
                className="color-picker-input"
              />
              <div className="tooltip-content1">Choose Color</div>
            </div>
          )}
        </div>
      </div>

      {analysisResult && <DraggableDiv analysisResult={analysisResult} />}
    </div>
  );
};

export default DrawCanvas;
