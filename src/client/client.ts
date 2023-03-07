import { DataConnection, Peer } from "peerjs";
import * as QRCode from "qrcode";
// import type QrScannerType from "qr-scanner";
import QrScanner from "qr-scanner";

const peer = new Peer();
let browserFile: string;
let qrScanner: any;

const onOpen = (connection: DataConnection) => {
  connection.on("data", (data: any) => {
    console.log("otherConnection's data", data);
    const div = document.createElement("div");
    div.innerHTML = data;

    document.querySelector(".upload-btn-wrapper").innerHTML = null;
    document.querySelector(".action-box").innerHTML = null;
    document.querySelector(".action-box").appendChild(div);
  });
  if (browserFile) {
    connection.send(browserFile, true);
  }
};

const onScan = ({ data }) => {
  const otherConnectionsId = data;
  const connect = peer.connect(otherConnectionsId);
  if (data) {
    connect.on("open", () => onOpen(connect));

    qrScanner.stop();
  }
};

const onConnection = (otherConnection: DataConnection) => {
  otherConnection.on("open", () => onOpen(otherConnection));
};

const handleScanning = () => {
  const videoEl: HTMLVideoElement = document.querySelector(".video");
  qrScanner = new QrScanner(videoEl, onScan, {});
  qrScanner.start();
};
const onUpload = () => {
  const input: HTMLInputElement = document.querySelector("input");
  const file: File = input.files[0];

  const div: HTMLDivElement = document.createElement("div");

  const fileReader = new FileReader();
  fileReader.onload = () => {
    const result: string | ArrayBuffer = fileReader.result;
    if (typeof result === "string") {
      div.innerHTML = result;
      browserFile = result;
    }
    document.querySelector(".action-box").innerHTML = null;
    document.querySelector(".action-box").appendChild(div);
  };
  fileReader.readAsText(file);
};

window.onload = () => {
  const scanEl = document.querySelector(".scan");
  scanEl.addEventListener("click", handleScanning);

  peer.on("open", (id) => {
    const canvas = document.getElementById("canvas");
    QRCode.toCanvas(canvas, id, () => {});
  });
  peer.on("connection", onConnection);

  const uploadEl = document.getElementById("upload");
  uploadEl.addEventListener("change", onUpload);
};
