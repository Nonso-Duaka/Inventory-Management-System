"use client";

import React from 'react';
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { auth, firestore } from '@/firebase';
import {
  Box, Stack, Typography, Button, Modal, TextField, MenuItem, Select, InputLabel, FormControl, Drawer, AppBar, Toolbar, IconButton
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import MenuIcon from '@mui/icons-material/Menu';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import { collection, doc, getDocs, query, setDoc, deleteDoc, getDoc } from 'firebase/firestore';
import debounce from 'lodash/debounce';
import Login from './components/Login';


const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '90%',
  maxWidth: 400,
  bgcolor: 'background.paper',
  borderRadius: 4,
  boxShadow: 24,
  p: 4,
  display: 'flex',
  flexDirection: 'column',
  gap: 3,
};

const containerStyle = {
  width: '100vw',
  height: '100vh',
  display: 'flex',
  flexDirection: 'column',
  bgcolor: 'white',
  p: 2,
};

const headerStyle = {
  bgcolor: '#f5e0d1',
  color: 'black',
  p: 2,
  borderRadius: 1,
  textAlign: 'center',
};

const inventoryContainerStyle = {
  width: '100%',
  maxWidth: 800,
  maxHeight: 400,
  border: '1px solid #f5e0d1',
  borderRadius: 1,
  overflowY: 'auto',
  mt: 2,
  bgcolor: 'white',
  padding: '10px',
};

const itemBoxStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  bgcolor: 'white',
  padding: '10px 20px',
  borderRadius: 1,
  boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
  marginBottom: '10px',
};

const itemContentStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: 2,
  flex: 1,
};

const itemImageStyle = {
  width: 50,
  height: 50,
  borderRadius: '50%',
};

const itemTextStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  flexGrow: 1,
};

const quantityStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: 1,
};

const textBoxStyle = {
  padding: '5px 10px',
  bgcolor: '#f5e0d1',
  borderRadius: 1,
  fontSize: '16px',
};

const searchBarStyle = {
  mb: 2,
  width: '100%',
  maxWidth: 800,
};

const sidebarStyle = {
  width: 250,
  display: 'flex',
  flexDirection: 'column',
  gap: 2,
  bgcolor: '#f5e0d1',
  p: 2,
  color: 'black',
  borderRadius: 1,
  textAlign: 'center',
  height: '100%',
};

const debouncedSearch = debounce((value, setSearchTerm) => {
  setSearchTerm(value);
}, 300);

const InventoryItem = React.memo(({ item, removeItem, increaseQuantity }) => (
  <Box sx={itemBoxStyle}>
    <Box sx={itemContentStyle}>
      <Box component="img" src={item.image} alt={item.name} sx={itemImageStyle} />
      <Box sx={itemTextStyle}>
        <Typography variant="h6" sx={textBoxStyle}>{item.name}</Typography>
        <Typography variant="subtitle1" sx={textBoxStyle}>{item.category}</Typography>
      </Box>
      <Box sx={quantityStyle}>
        <Typography variant="h6" sx={textBoxStyle}>{item.quantity}</Typography>
        <IconButton onClick={() => removeItem(item.name)} sx={{ ml: 1 }}>
          <DeleteIcon />
        </IconButton>
        <IconButton onClick={() => increaseQuantity(item.name)} sx={{ ml: 1 }}>
          <AddIcon />
        </IconButton>
      </Box>
    </Box>
  </Box>
));

export default function Home() {
  const [user, setUser] = useState(null);
  const [inventory, setInventory] = useState([]);
  const [open, setOpen] = useState(false);
  const [itemName, setItemName] = useState('');
  const [category, setCategory] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [image, setImage] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
        updateInventory();
      } else {
        setUser(null);
      }
    });

    const handleBeforeUnload = () => {
      signOut(auth);
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      unsubscribe();
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  const updateInventory = useCallback(async () => {
    try {
      const snapshot = query(collection(firestore, 'inventory'));
      const docs = await getDocs(snapshot);
      const inventoryList = docs.docs.map(doc => ({ name: doc.id, ...doc.data() }));
      setInventory(inventoryList);
    } catch (error) {
      console.error('Error updating inventory:', error);
    }
  }, []);

  const addItem = async () => {
    if (!itemName || !category) {
      alert('Please fill in all fields');
      return;
    }
    try {
      const docRef = doc(collection(firestore, 'inventory'), itemName);
      const docSnap = await getDoc(docRef);
      const newItem = {
        name: itemName,
        category,
        quantity: 1,
        image,
      };
      if (docSnap.exists()) {
        const { quantity } = docSnap.data();
        await setDoc(docRef, { ...newItem, quantity: quantity + 1 });
      } else {
        await setDoc(docRef, newItem);
      }
      await updateInventory();
      handleClose();
    } catch (error) {
      console.error('Error adding item:', error);
    }
  };

  const removeItem = async (item) => {
    try {
      const docRef = doc(collection(firestore, 'inventory'), item);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const { quantity } = docSnap.data();
        if (quantity === 1) {
          await deleteDoc(docRef);
        } else {
          await setDoc(docRef, { ...docSnap.data(), quantity: quantity - 1 });
        }
      }
      await updateInventory();
    } catch (error) {
      console.error('Error removing item:', error);
    }
  };

  const increaseQuantity = async (item) => {
    try {
      const docRef = doc(collection(firestore, 'inventory'), item);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const { quantity } = docSnap.data();
        await setDoc(docRef, { ...docSnap.data(), quantity: quantity + 1 });
      }
      await updateInventory();
    } catch (error) {
      console.error('Error increasing quantity:', error);
    }
  };

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setItemName('');
    setCategory('');
    setImage(null);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const startCamera = async () => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      } catch (error) {
        console.error('Error accessing camera:', error);
      }
    }
  };

  const captureImage = () => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    if (videoRef.current && context) {
      context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      setImage(canvas.toDataURL('image/png'));
    }
  };

  const toggleDrawer = () => {
    setDrawerOpen((prev) => !prev);
  };

  const handleSearchChange = (e) => {
    debouncedSearch(e.target.value, setSearchTerm);
  };

  const filteredInventory = useMemo(
    () => inventory.filter((item) => item.name.toLowerCase().includes(searchTerm.toLowerCase())),
    [inventory, searchTerm]
  );

  if (!user) {
    return <Login onLogin={() => updateInventory()} />;
  }

  return (
    <Box sx={containerStyle}>
      <AppBar position="static" sx={headerStyle}>
        <Toolbar>
          <IconButton edge="start" color="inherit" aria-label="menu" onClick={toggleDrawer}>
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Inventory Management System
          </Typography>
        </Toolbar>
      </AppBar>
      <Drawer anchor="left" open={drawerOpen} onClose={toggleDrawer}>
        <Box sx={sidebarStyle}>
          <Typography variant="h5">Inventory</Typography>
          <Button variant="contained" color="primary" onClick={handleOpen}>
            Add New Item
          </Button>
          <Button variant="contained" color="secondary" onClick={() => signOut(auth)}>
            Sign Out
          </Button>
        </Box>
      </Drawer>
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 2 }}>
        <TextField
          label="Search"
          variant="outlined"
          fullWidth
          value={searchTerm}
          onChange={handleSearchChange}
          sx={searchBarStyle}
        />
        <Stack sx={inventoryContainerStyle}>
          {filteredInventory.map((item) => (
            <InventoryItem
              key={item.name}
              item={item}
              removeItem={removeItem}
              increaseQuantity={increaseQuantity}
            />
          ))}
        </Stack>
      </Box>
      <Modal open={open} onClose={handleClose}>
        <Box sx={modalStyle}>
          <Typography variant="h5">Add New Item</Typography>
          <TextField
            label="Item Name"
            variant="outlined"
            fullWidth
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
          />
          <FormControl fullWidth variant="outlined">
            <InputLabel>Category</InputLabel>
            <Select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              label="Category"
            >
              <MenuItem value="Food">Food</MenuItem>
              <MenuItem value="Drinks">Drinks</MenuItem>
              <MenuItem value="Supplies">Supplies</MenuItem>
              <MenuItem value="Electronics">Electronics</MenuItem>
              <MenuItem value="Clothing">Clothing</MenuItem>
              <MenuItem value="Furniture">Furniture</MenuItem>
            </Select>
          </FormControl>
          <Button variant="contained" component="label">
            Upload Image
            <input type="file" hidden onChange={handleImageUpload} />
          </Button>
          <Box>
            <Button variant="contained" onClick={startCamera} sx={{ mr: 1 }}>
              <CameraAltIcon />
            </Button>
            <Button variant="contained" onClick={captureImage}>Capture</Button>
            <video ref={videoRef} style={{ display: 'none' }} width="640" height="480" />
            <canvas ref={canvasRef} style={{ display: 'none' }} width="640" height="480"></canvas>
          </Box>
          {image && <Box component="img" src={image} alt="Item" sx={{ width: '100%', height: 'auto', borderRadius: 1, mt: 2 }} />}
          <Button variant="contained" color="primary" onClick={addItem}>Add Item</Button>
        </Box>
      </Modal>
    </Box>
  );
}
