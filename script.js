// Hardcoded list of names for the dropdown
const rowHeaderNames = [
  "Ahsan", "Nasa", "Alif", "Alifah", "Hanin", "Rijal", "Hasna",
  "Fathir", "Tsabita", "Yusuf", "Fafa", "Umar", "Aisyah", "Ridho", "Arza"
];

const signatureCanvas = document.getElementById('signature-canvas');
const signatureCtx = signatureCanvas.getContext('2d');
let isSignatureDrawing = false;

// Populate the name dropdown
function populateNameDropdown() {
  const nameSelect = document.getElementById('name');
  nameSelect.innerHTML = '<option value="" disabled selected>Select your name</option>';
  // Only show names that don't have signatures
  const data = JSON.parse(localStorage.getItem('spreadsheetData')) || Array(rowHeaderNames.length).fill().map(() => Array(1).fill({ text: '', image: '' }));
  rowHeaderNames.forEach((name, index) => {
    if (!data[index][0].image) { // Only add names without signatures
      const option = document.createElement('option');
      option.value = name;
      option.textContent = name;
      nameSelect.appendChild(option);
    }
  });
  // Check if all signatures are collected
  checkFullState();
}

// Check if all signatures are present
function checkFullState() {
  const data = JSON.parse(localStorage.getItem('spreadsheetData')) || Array(rowHeaderNames.length).fill().map(() => Array(1).fill({ text: '', image: '' }));
  const allSigned = data.every(row => row[0].image);
  const formStatus = document.getElementById('form-status');
  if (allSigned) {
    formStatus.textContent = 'All signatures have been collected!';
    formStatus.style.color = '#9ae01e';
    document.getElementById('contact-form').style.display = 'none'; // Hide form when full
  } else {
    formStatus.textContent = '';
    document.getElementById('contact-form').style.display = 'block';
  }
}

// Signature Canvas Setup
function setupSignatureCanvas() {
  signatureCtx.lineWidth = 2;
  signatureCtx.lineCap = 'round';
  signatureCtx.strokeStyle = '#333333';
  
  signatureCanvas.addEventListener('mousedown', (e) => {
    isSignatureDrawing = true;
    signatureCtx.beginPath();
    signatureCtx.moveTo(e.offsetX, e.offsetY);
  });
  
  signatureCanvas.addEventListener('mousemove', (e) => {
    if (isSignatureDrawing) {
      signatureCtx.lineTo(e.offsetX, e.offsetY);
      signatureCtx.stroke();
    }
  });
  
  signatureCanvas.addEventListener('mouseup', () => {
    isSignatureDrawing = false;
    signatureCtx.closePath();
  });
  
  signatureCanvas.addEventListener('mouseout', () => {
    isSignatureDrawing = false;
    signatureCtx.closePath();
  });
  
  signatureCanvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    isSignatureDrawing = true;
    const touch = e.touches[0];
    const rect = signatureCanvas.getBoundingClientRect();
    signatureCtx.beginPath();
    signatureCtx.moveTo(touch.clientX - rect.left, touch.clientY - rect.top);
  });
  
  signatureCanvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    if (isSignatureDrawing) {
      const touch = e.touches[0];
      const rect = signatureCanvas.getBoundingClientRect();
      signatureCtx.lineTo(touch.clientX - rect.left, touch.clientY - rect.top);
      signatureCtx.stroke();
    }
  });
  
  signatureCanvas.addEventListener('touchend', () => {
    isSignatureDrawing = false;
    signatureCtx.closePath();
  });
  
  document.querySelector('.btn-clear').addEventListener('click', () => {
    signatureCtx.clearRect(0, 0, signatureCanvas.width, signatureCanvas.height);
  });
}

// Contact Form Submission
document.getElementById('contact-form').addEventListener('submit', async function(e) {
  e.preventDefault();
  const form = e.target;
  const formStatus = document.getElementById('form-status');
  const submitButton = document.querySelector('.btn-primary');
  submitButton.disabled = true;
  
  try {
    const imageData = signatureCtx.getImageData(0, 0, signatureCanvas.width, signatureCanvas.height).data;
    const isCanvasEmpty = !Array.from(imageData).some(value => value !== 0);
    if (isCanvasEmpty) {
      formStatus.textContent = 'Please draw a signature before submitting.';
      formStatus.style.color = '#ff4d4d';
      submitButton.disabled = false;
      return;
    }
    
    const name = document.getElementById('name').value;
    if (!name) {
      formStatus.textContent = 'Please select a name.';
      formStatus.style.color = '#ff4d4d';
      submitButton.disabled = false;
      return;
    }
    
    const rowIndex = rowHeaderNames.indexOf(name);
    if (rowIndex === -1) {
      formStatus.textContent = 'Selected name not found.';
      formStatus.style.color = '#ff4d4d';
      submitButton.disabled = false;
      return;
    }
    
    // Load existing data from localStorage
    let data = JSON.parse(localStorage.getItem('spreadsheetData')) || Array(rowHeaderNames.length).fill().map(() => Array(1).fill({ text: '', image: '' }));
    
    if (data[rowIndex][0].image) {
      formStatus.textContent = 'A signature already exists for this name.';
      formStatus.style.color = '#ff4d4d';
      submitButton.disabled = false;
      return;
    }
    
    const dataURL = signatureCanvas.toDataURL('image/png', 0.9);
    data[rowIndex][0].image = dataURL;
    
    // Save updated data to localStorage
    localStorage.setItem('spreadsheetData', JSON.stringify(data));
    
    signatureCtx.clearRect(0, 0, signatureCanvas.width, signatureCanvas.height);
    document.getElementById('name').value = '';
    formStatus.textContent = 'Signature saved successfully!';
    formStatus.style.color = '#9ae01e';
    
    // Refresh dropdown and check full state
    populateNameDropdown();
  } catch (error) {
    console.error('Error processing form:', error);
    formStatus.textContent = `Error: ${error.message}`;
    formStatus.style.color = '#ff4d4d';
  } finally {
    submitButton.disabled = false;
  }
});

// Listen for storage events to update the form in real-time
window.addEventListener('storage', (event) => {
  if (event.key === 'spreadsheetData') {
    populateNameDropdown();
  }
});

// Initialize the form
setupSignatureCanvas();
populateNameDropdown();
document.getElementById('contact-form').reset();
signatureCtx.clearRect(0, 0, signatureCanvas.width, signatureCanvas.height);

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDApxCwdqXURI9AXdNvwRK5LDwqDPMXe_I",
  authDomain: "atheneumsync.firebaseapp.com",
  databaseURL: "https://atheneumsync-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "atheneumsync",
  storageBucket: "atheneumsync.firebasestorage.app",
  messagingSenderId: "383620444372",
  appId: "1:383620444372:web:fc408b459512629d0e8b41",
  measurementId: "G-Y4MX263QBM"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

firebase.initializeApp(firebaseConfig);
const database = firebase.database();
