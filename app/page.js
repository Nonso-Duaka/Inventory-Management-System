'use client'

import { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import { Box, Stack, Typography, Button, Modal, TextField, IconButton, MenuItem, Select, InputLabel, FormControl } from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import AddIcon from '@mui/icons-material/Add'
import { firestore } from '@/firebase'
import {
  collection,
  doc,
  getDocs,
  query,
  setDoc,
  deleteDoc,
  getDoc,
} from 'firebase/firestore'

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'white',
  borderRadius: 4,
  boxShadow: 24,
  p: 4,
  display: 'flex',
  flexDirection: 'column',
  gap: 3,
}

const containerStyle = {
  width: '100vw',
  height: '100vh',
  display: 'flex',
  justifyContent: 'center',
  flexDirection: 'column',
  alignItems: 'center',
  gap: 2,
  bgcolor: '#f0f4f8',
  padding: 2,
}

const headerStyle = {
  width: '100%',
  maxWidth: 800,
  bgcolor: '#00796b',
  color: 'white',
  p: 2,
  borderRadius: 1,
  textAlign: 'center',
  textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
}

const itemBoxStyle = {
  width: '100%',
  minHeight: 80,
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  bgcolor: '#ffffff',
  padding: '10px 20px',
  borderRadius: 1,
  boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
}

const textBoxStyle = {
  padding: '5px 10px',
  bgcolor: '#e0f2f1',
  borderRadius: 1,
  textShadow: '1px 1px 2px rgba(0,0,0,0.1)',
  fontSize: '16px',
}

const inventoryContainerStyle = {
  width: '100%',
  maxWidth: 800,
  maxHeight: 400,
  border: '1px solid #00796b',
  borderRadius: 1,
  overflowY: 'auto',
  mt: 2,
  bgcolor: 'white',
}

const searchBarStyle = {
  mb: 2,
  width: '100%',
  maxWidth: 800,
}

export default function Home() {
  const [inventory, setInventory] = useState([])
  const [open, setOpen] = useState(false)
  const [itemName, setItemName] = useState('')
  const [category, setCategory] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [image, setImage] = useState(null)
  const [classification, setClassification] = useState('')
  const videoRef = useRef(null)
  const canvasRef = useRef(null)

  const updateInventory = async () => {
    const snapshot = query(collection(firestore, 'inventory'))
    const docs = await getDocs(snapshot)
    const inventoryList = []
    docs.forEach((doc) => {
      inventoryList.push({ name: doc.id, ...doc.data() })
    })
    setInventory(inventoryList)
  }

  useEffect(() => {
    updateInventory()
  }, [])

  const addItem = async (item) => {
    const docRef = doc(collection(firestore, 'inventory'), item)
    const docSnap = await getDoc(docRef)
    const newItem = {
      name: itemName,
      category,
      quantity: 1
    }
    if (docSnap.exists()) {
      const { quantity } = docSnap.data()
      await setDoc(docRef, { ...newItem, quantity: quantity + 1 })
    } else {
      await setDoc(docRef, newItem)
    }
    await updateInventory()
  }

  const removeItem = async (item) => {
    const docRef = doc(collection(firestore, 'inventory'), item)
    const docSnap = await getDoc(docRef)
    if (docSnap.exists()) {
      const { quantity } = docSnap.data()
      if (quantity === 1) {
        await deleteDoc(docRef)
      } else {
        await setDoc(docRef, { ...docSnap.data(), quantity: quantity - 1 })
      }
    }
    await updateInventory()
  }

  const increaseQuantity = async (item) => {
    const docRef = doc(collection(firestore, 'inventory'), item)
    const docSnap = await getDoc(docRef)
    if (docSnap.exists()) {
      const { quantity } = docSnap.data()
      await setDoc(docRef, { ...docSnap.data(), quantity: quantity + 1 })
    }
    await updateInventory()
  }

  const handleOpen = () => setOpen(true)
  const handleClose = () => {
    setOpen(false)
    setImage(null)
    setClassification('')
  }

  const startCamera = async () => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      videoRef.current.srcObject = stream
      videoRef.current.play()
    }
  }

  const captureImage = () => {
    const context = canvasRef.current.getContext('2d')
    context.drawImage(videoRef.current, 0, 0, 640, 480)
    canvasRef.current.toBlob(async (blob) => {
      const formData = new FormData()
      formData.append('file', blob)
      formData.append('upload_preset', 'your_upload_preset') // For image upload service

      try {
        const response = await axios.post('https://api.imagerecognition.com/classify', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer abc123xyz456`
          }
        })
        setClassification(response.data.classification)
      } catch (error) {
        console.error('Error classifying image:', error)
      }
    })
  }

  const filteredInventory = inventory.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.category && item.category.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  return (
    <Box sx={containerStyle}>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={modalStyle}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            Add Item
          </Typography>
          <Stack width="100%" direction={'column'} spacing={2}>
            <TextField
              id="outlined-basic"
              label="Item"
              variant="outlined"
              fullWidth
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
            />
            <FormControl fullWidth>
              <InputLabel id="category-label">Category</InputLabel>
              <Select
                labelId="category-label"
                id="category"
                value={category}
                label="Category"
                onChange={(e) => setCategory(e.target.value)}
              >
                <MenuItem value={'groceries'}>Groceries</MenuItem>
                <MenuItem value={'electronics'}>Electronics</MenuItem>
                <MenuItem value={'clothing'}>Clothing</MenuItem>
                <MenuItem value={'home'}>Home</MenuItem>
                <MenuItem value={'garden'}>Garden</MenuItem>
                <MenuItem value={'toys'}>Toys</MenuItem>
                <MenuItem value={'sports'}>Sports</MenuItem>
                <MenuItem value={'beauty'}>Beauty</MenuItem>
                <MenuItem value={'pharmacy'}>Pharmacy</MenuItem>
                <MenuItem value={'automotive'}>Automotive</MenuItem>
              </Select>
            </FormControl>
            <Button
              variant="contained"
              sx={{ bgcolor: '#00796b' }}
              onClick={() => {
                addItem(itemName)
                setItemName('')
                setCategory('')
                handleClose()
              }}
            >
              Add
            </Button>
          </Stack>
        </Box>
      </Modal>
      <TextField
        id="search-bar"
        label="Search"
        variant="outlined"
        fullWidth
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        sx={searchBarStyle}
      />
      <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
        <Button variant="contained" sx={{ bgcolor: '#00796b' }} onClick={handleOpen}>
          Add New Item
        </Button>
        <Button variant="contained" sx={{ bgcolor: '#00796b' }} onClick={startCamera}>
          Start Camera
        </Button>
        <Button variant="contained" sx={{ bgcolor: '#00796b' }} onClick={captureImage}>
          Capture Image
        </Button>
      </Stack>
      <Box sx={inventoryContainerStyle}>
        <Stack spacing={2} sx={{ padding: 2 }}>
          {filteredInventory.map((item) => (
            <Box key={item.name} sx={itemBoxStyle}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography sx={textBoxStyle}>{item.name}</Typography>
                <Typography sx={textBoxStyle}>{item.category}</Typography>
                <Typography sx={textBoxStyle}>Quantity: {item.quantity}</Typography>
              </Box>
              <Box>
                <IconButton
                  color="primary"
                  onClick={() => removeItem(item.name)}
                >
                  <DeleteIcon />
                </IconButton>
                <IconButton
                  color="primary"
                  onClick={() => increaseQuantity(item.name)}
                >
                  <AddIcon />
                </IconButton>
              </Box>
            </Box>
          ))}
        </Stack>
      </Box>
      <video ref={videoRef} style={{ display: 'none' }}></video>
      <canvas ref={canvasRef} style={{ display: 'none' }} width="640" height="480"></canvas>
    </Box>
  )
}
