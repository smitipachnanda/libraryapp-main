import React from 'react';
import {Text, View, TouchableOpacity, StyleSheet,TextInput,Image,KeyboardAvoidingView,ToastAndroid} from 'react-native';
import * as Permissions from 'expo-permissions';
import {BarCodeScanner} from 'expo-barcode-scanner'
import * as firebase from 'firebase';

import db from '../config';

export default class TransactionScreen extends React.Component{
    constructor(){
        super();
        this.state = {
            hasCameraPermissions:null,
            scanned: false,
            scannedData:'', 
            buttonState:'normal',
            scannedbookid:'',
            scannedstudentid:'',
            transactionMessage:'',
        }
    }

    getCameraPermissions = async(id)=>{
        const {status} = await Permissions.askAsync(Permissions.CAMERA)
        this.setState({
        /*status==='granted' is true when the user grants the permission
        status ==='granted' is false if user does not grant permission*/
        hasCameraPermissions:status==='granted',
        buttonState: id,
        scanned: false
     })
    }

    handleBarCodeScanned = async({type,data})=>{
        const {buttonState}=this.state
        if(buttonState==="bookid"){
        this.setState({
            scanned:true,
            scannedbookid:data,
            buttonState:'normal'
        })
    }
    else if(buttonState==="studentid"){
        this.setState({
            scanned:true,
            scannedstudentid:data,
            buttonState:'normal'
        })
    }
    }

        initiatebookissue=async()=>{
            //add a transcation
            db.collection("transaction").add({
                'studentid':this.state.scannedstudentid,
                'bookid':this.state.scannedbookid,
                'date':firebase.firestore.Timestamp.now().toDate(),
                'transactiontype': "issue"
            })
            //change book status
            db.collection("books").doc(this.state.scannedbookid).update({
                'bookavailability':false

            })
            // change number of books for students
            db.collection("students").doc(this.state.scannedstudentid).update({
                'numberofbooksissued':firebase.firestore.FieldValue.increment(1)

            })
            this.setState({
                scannedstudentid:'',
                scannedbookid:''
            })
        }


        initiatebookreturn=async()=>{
            //add a transcation
            db.collection("transaction").add({
                'studentid':this.state.scannedstudentid,
                'bookid':this.state.scannedbookid,
                'date':firebase.firestore.Timestamp.now().toDate(),
                'transactiontype': "return"
            })
            //change book status
            db.collection("books").doc(this.state.scannedbookid).update({
                'bookavailability':true

            })
            // change number of books for students
            db.collection("students").doc(this.state.scannedstudentid).update({
                'numberofbooksissued':firebase.firestore.FieldValue.increment(-1)

            })
            this.setState({
                scannedstudentid:'',
                scannedbookid:''
            })
        }

    handleTransaction=async()=>{
         var transactionMessage=null;
         db.collection("books").doc(this.state.scannedbookid).get()
        .then((doc)=>{
            var books = doc.data();
            if(books.bookavailability){
                this.initiatebookissue();
                transactionMessage="book issued"
                ToastAndroid.show(transactionMessage,ToastAndroid.SHORT)

            }
            else{this.initiatebookreturn()
            transactionMessage="book return"}
            ToastAndroid.show(transactionMessage,ToastAndroid.SHORT)
        })
        this.setState({
            transactionMessage:transactionMessage
        })
    }
    
    render(){
        const hasCameraPermissions = this.state.hasCameraPermissions;
        const scanned = this.state.scanned;
        const buttonState = this.state.buttonState;

        if(buttonState !=='normal' && hasCameraPermissions){
            return(
                <BarCodeScanner 
                onBarCodeScanned = {scanned ? undefined : this.handleBarCodeScanned}
                style={StyleSheet.absoluteFillObject}
                />

            )
        }
        else if(buttonState === 'normal')
                return(
            <KeyboardAvoidingView style={styles.container}>
                <View>
                    <Image source={require("../assets/booklogo.jpg")}
                    style={{width:200,height:200}}>
                    </Image>
                    <Text style={{textAlign:'center',fontSize:30}}>Willy</Text>
                       </View>
                       <View>
                    <TextInput 
                    onChangeText={t=>{this.setState({scannedbookid:t})}}
                    placeholder="book id">
                    value={this.state.scannedbookid}
                    </TextInput>

                    <TouchableOpacity style={styles.scanButton}
                onPress = {this.getCameraPermissions('bookid')}>
                <Text>Scan QR Code</Text>
                </TouchableOpacity>
                </View>

                <View>
                <TextInput
                 onChangeText={t=>{this.setState({scannedstudentid:t})}}
                    placeholder="student id">
                    value={this.state.scannedstudentid}
                    </TextInput>

                    <TouchableOpacity style={styles.scanButton}
                onPress = {this.getCameraPermissions('studentid')}>
                <Text>Scan QR Code</Text>
                </TouchableOpacity>
                </View>
                    <TouchableOpacity style={styles.submitButton}
                    onPress={()=>{
                        this.handleTransaction();
                        this.setState({
                            scannedbookid:'',
                            scannedstudentid:''
                        })
                    }}>
                   
                        <Text style={styles.submitText}>Submit</Text>
                        
                    </TouchableOpacity>
                  
            </KeyboardAvoidingView>
        )
    }
}


const styles = StyleSheet.create(
    {
        container:{
            flex:1, 
            justifyContent:'center', 
            alignItems:'center'
        },
        displayText:{
            fontSize:15,
            textDecorationLine:'underline'
        },
        scanButton:{
            backgroundColor:'#2196F3',
            padding:10,
            margin:10
        },
        buttonText:{
            fontSize:20
        },
        submitButton:{
            backgroundColor:"black",
            width:100,
            height:50
        },
        submitText:{
            fontSize:20,
            textAlign:"center",
            color:"white",
            fontWeight:"bold"
        }
    }
)