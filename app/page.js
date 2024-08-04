//Import Modules.
'use client'
import {useState, useEffect} from "react";
import { Box, Typography, Button, Stack } from "@mui/material";
import AddIcon from '@mui/icons-material/Add';
import { createTheme, ThemeProvider, useTheme } from '@mui/material/styles';
import { outlinedInputClasses } from '@mui/material/OutlinedInput';
import Grid from '@mui/material/Unstable_Grid2';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import { Delete, Translate } from "@mui/icons-material";
import TextField from '@mui/material/TextField';
import Modal from '@mui/material/Modal';
import { firestore } from "@/firebase";
import {collection, deleteDoc, doc, getDocs, query, setDoc, getDoc} from 'firebase/firestore'


//Theme for Button.
const buttonTheme = createTheme({
  palette: {
    primary: {
      main: '#FD7014',
    },
  },
});

// Theme For Search Bar.
const searchTheme = (outerTheme) =>
  createTheme({
    palette: {
      mode: outerTheme.palette.mode,
    },
    components: {
      MuiTextField: {
        styleOverrides: {
          root: {
            '--TextField-brandBorderColor': '#FD7014',
            '--TextField-brandBorderHoverColor': '#FD7014',
            '--TextField-brandBorderFocusedColor': '#FD7014',
            '& label.Mui-focused': {
              color: 'var(--TextField-brandBorderFocusedColor)',
            },
          },
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          notchedOutline: {
            borderColor: 'var(--TextField-brandBorderColor)',
          },
          root: {
            backgroundColor: '#EEEEEE', // Set background color to white
            '&:hover': {
              backgroundColor: '#EEEEEE', // Maintain white background on hover
            },
            [`&.${outlinedInputClasses.focused}`]: {
              backgroundColor: '#EEEEEE', // Maintain white background when focused
            },
            [`&:hover .${outlinedInputClasses.notchedOutline}`]: {
              borderColor: 'var(--TextField-brandBorderHoverColor)',
            },
            [`&.Mui-focused .${outlinedInputClasses.notchedOutline}`]: {
              borderColor: 'var(--TextField-brandBorderFocusedColor)',
            },
          },
        },
      },
    },
});




//Main Function.
export default function Home() {

  const [inventory, setInventory] = useState([]);
  const [itemName, setItemName] = useState('');
  
  const [searchItem, setSearchItem] = useState('');
  const [filterInv, setFilterInv] = useState([]);


  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const outerTheme = useTheme();


  {/* Update Inv */}
  const updateInventory = async () => {
    const snapshot = query(collection(firestore, 'inventory')) 
    const docs = await getDocs(snapshot)
    const inventoryList = []
    docs.forEach((doc)=>{
      inventoryList.push({
        name: doc.id,
        ...doc.data(),
      })
    })
    setInventory(inventoryList)
    setFilterInv(inventoryList)
  }

  useEffect(()=>{
    updateInventory()
  }, [])

  console.log(inventory);


  {/* Add Inv */}
  const addItem = async (item)=>{
    const docRef = doc(collection(firestore, 'inventory'), item)
    const docSnap = await getDoc(docRef)

    if(docSnap.exists()){
      const {count} = docSnap.data()
      await setDoc(docRef, {count: count+1})
    }
    else{
        await setDoc(docRef, {count:1})
    }
    await updateInventory()
  }


  {/* Remove Inv */}
  const removeItem = async (item)=>{
    const docRef = doc(collection(firestore, 'inventory'), item)
    const docSnap = await getDoc(docRef)

    if(docSnap.exists()){
      const {count} = docSnap.data()
      if(count === 1){
        await deleteDoc(docRef)
      }
      else{
        await setDoc(docRef, {count: count-1})
      }
    }
    await updateInventory()
  }
  

  {/* Search Inv */}
  const handleSearch = (event)=>{
    const query = event.target.value.toLowerCase();
    setSearchItem(query);

    const filtered = inventory.filter(({ name }) =>
      name.toLowerCase().includes(query)
    );

    setFilterInv(filtered);
  };

  return (
    <Box width="100%" height="100%" display="flex" flexDirection="column" justifyContent="center" alignItems="center" bgcolor="#222831;" gap={5}>
      
      <Typography variant="h1">Pantry Pal</Typography>
      
      {/* Search Bar */}
      <ThemeProvider theme={searchTheme(outerTheme)}>
        <TextField label="Search Item..." 
        sx={{width: 300}}
        value={searchItem}
        onChange={handleSearch}
        />
      </ThemeProvider>
      
      {/* Add Item */}
      <div>
        <ThemeProvider theme={buttonTheme}>
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpen}>
            <Typography sx={{ textTransform: 'none' }}>Add Item</Typography>
          </Button>
        </ThemeProvider>
        {/* Modal */}
        <Modal open={open} onClose={handleClose}>
          <Box
          position="absolute"
          top="50%"
          left="50%"
          width={400}
          bgcolor="#EEEEEE"
          border="2px solid #000"
          boxShadow={24}
          p={4}
          display="flex"
          flexDirection="column"
          gap={3}
          sx={{transform:"translate(-50%,-50%)",}}
          >
          
          <Typography variant="h6" sx={{color:"#FD7014"}}>Item Name</Typography>
          <Stack width="100%" direction="row" spacing={2}>
            <ThemeProvider theme={searchTheme(outerTheme)}>
              <TextField label="Enter Name" 
              value={itemName}
              onChange={(e)=>{
                setItemName(e.target.value)
              }}
              />
            </ThemeProvider>
            <ThemeProvider theme={buttonTheme}>
              <Button variant="contained" startIcon={<AddIcon />} 
              onClick={()=>{
                addItem(itemName)
                setItemName('')
                handleClose()
              }}>
                <Typography sx={{ textTransform: 'none' }}>Add</Typography>
              </Button>
            </ThemeProvider>
          </Stack>
          
          </Box>
        </Modal>
      </div>
      


      <Typography variant="h4" marginTop={5}>Your Inventory</Typography>

      {/* Your Items */}
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: {
            xs: 'center', 
            sm: 'center', 
            md: 'flex-start', 
            lg: 'flex-start',
          },
          gap: 3, 
          padding: 2,
        }}
      >
      {filterInv.map(({ name, count }) => (
      <Box
        key={name}
        sx={{
          flex: {
            xs: '1 1 calc(50% - 20px)', 
            sm: '1 1 calc(50% - 20px)', 
            md: '1 1 calc(33.33% - 20px)',
            lg: '1 1 calc(25% - 20px)',
          },
          display: 'flex',
          justifyContent: 'center', 
          alignItems: 'center',
          minWidth: '250px',
          maxWidth: '300px',
          margin: '0 auto', 
        }}
      >
      <Card
              sx={{
                width: '100%',
                height: 200,
                padding: 1,
                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', 
                borderRadius: 2, 
                display: 'flex',
                flexDirection: 'column', 
                justifyContent: 'space-between', 
              }}
            >
              <CardContent
                sx={{
                  padding: 2,
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  height: '100%',
                }}
              >
                <Typography
                  gutterBottom
                  variant="h5"
                  component="div"
                  color="#222831"
                >
                  {name.charAt(0).toUpperCase() + name.slice(1).toLowerCase()}
                </Typography>
                <Typography gutterBottom component="div" color="#222831">
                  Count: {count}
                </Typography>
              </CardContent>

              {/* Card Buttons */}
              <CardActions sx={{ justifyContent: 'center' }}>
                <ThemeProvider theme={buttonTheme}>
                  <Button
                    size="small"
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => addItem(name)} 
                  >
                    <Typography sx={{ textTransform: 'none' }}>Add</Typography>
                  </Button>
                  <Button
                    size="small"
                    variant="contained"
                    startIcon={<Delete />}
                    onClick={() => removeItem(name)} 
                  >
                    <Typography sx={{ textTransform: 'none' }}>Remove</Typography>
                  </Button>
                </ThemeProvider>
              </CardActions>
            </Card>
      </Box>
    ))}
    </Box>


  </Box>
  );
}
