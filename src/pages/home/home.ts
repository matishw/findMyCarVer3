import { Component, ElementRef, ViewChild, NgZone } from '@angular/core';
import { Platform, AlertController, ModalController } from "ionic-angular";
import { GoogleMaps, GoogleMap, LatLng, GoogleMapsEvent, GoogleMapOptions } from "@ionic-native/google-maps";
import { Geolocation } from '@ionic-native/geolocation';
import { NativeGeocoder, NativeGeocoderReverseResult, NativeGeocoderForwardResult } from '@ionic-native/native-geocoder';
import { Storage } from '@ionic/storage';
import { Flashlight } from '@ionic-native/flashlight';
import { Diagnostic } from '@ionic-native/diagnostic';
import { OpenNativeSettings } from '@ionic-native/open-native-settings';
import { Camera, CameraOptions } from '@ionic-native/camera';
import { NoteModalPage } from '../note-modal/note-modal';
@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  noteInfo: string = null;

  @ViewChild('map')
  private mapElement: ElementRef;
  private map: GoogleMap;
  private location: LatLng;
  private locationPark: LatLng;
  saveCarInfo: string = null;
  dateParking: Date;
  userLocation: any;
  isOpenFlash: boolean = false;
  cameraImage: string = null;
  accuracy: any;

  carMarker: any;
  constructor(private platform: Platform, private googleMaps: GoogleMaps, private geolocation: Geolocation,
    private nativeGeocoder: NativeGeocoder, private storage: Storage, private alertCtrl: AlertController,
    public zone: NgZone, private flashlight: Flashlight, private diagnostic: Diagnostic,
    private openNativeSettings: OpenNativeSettings, private camera: Camera, public modalCtrl: ModalController) {
    this.location = new LatLng(42.346903, -71.135101);
  }

  ionViewDidLoad() {
    //this.createMap();

    this.platform.ready().then(() => {


      this.diagnostic.isGpsLocationAvailable()
        .then((state) => {

          if (state) {
            // do something

          } else {
            // do something else
            this.openNativeSettings.open("location");
          }
        }).catch(e => alert("not enable " + e));

      var options = {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      };

      this.geolocation.getCurrentPosition(options).then((resp) => {
        this.accuracy = resp.coords.accuracy;
        this.location = new LatLng(resp.coords.latitude, resp.coords.longitude);


        let watch = this.geolocation.watchPosition();
        watch.subscribe((data) => {


          this.location = new LatLng(data.coords.latitude, data.coords.longitude);

          if (this.userLocation != undefined) {
            this.userLocation.setPosition({ lat: data.coords.latitude, lng: data.coords.longitude });
          }


          let counter = 0;

        });

        this.loadMap();

      }).catch((error) => {
        console.log('Error getting location', error);
      });



    });
  }

  openCloseFlash() {

    if (!this.flashlight.isSwitchedOn()) {
      this.flashlight.switchOn();
      this.isOpenFlash = true;
    }
    else {
      this.flashlight.switchOff();
      this.isOpenFlash = false;
    }



  }

  openModalSaveNotes() {
    let tt: string;

    let profileModal = this.modalCtrl.create(NoteModalPage, { note: this.noteInfo });
    profileModal.onDidDismiss(data => {
      //this.saveParkingCar(data, false);
      if (data['note'] != undefined) {
        this.noteInfo = data['note'];
        this.saveNewLocation();
      }

    });
    profileModal.present();



  }


  saveNewLocation() {

    var latLng =
      {
        'lat': this.locationPark.lat,
        'lng': this.locationPark.lng,
        'time': this.dateParking,
        'adress': this.saveCarInfo,
        'image': this.cameraImage,
        'note': this.noteInfo
      }


    this.storage.set('latlng', JSON.stringify(latLng)).then(() => {


    });


  }

  clearStorage() {
    let alert = this.alertCtrl.create({
      title: 'Delete last parking location!',
      subTitle: 'Are you sure you want to delete your last parking location?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {
            console.log('Cancel clicked');
          }
        },
        {
          text: 'Yes',
          handler: () => {
            this.storage.clear();
            this.cameraImage = null;
            this.carMarker.remove();
            this.dateParking = null;
            this.saveCarInfo = null;
            this.noteInfo = null;
          }
        }
      ]
    });
    alert.present();
  }


  loadMap() {

    let mapOptions: GoogleMapOptions = {
      camera: {
        target: {
          lat: this.location.lat,
          lng: this.location.lng
        },
        zoom: 15,
        tilt: 30
      }
    };

    this.map = GoogleMaps.create('map_canvas', mapOptions);

    // Wait the MAP_READY before using any methods.
    this.map.on(GoogleMapsEvent.MAP_READY)
      .subscribe(() => {
        console.log('Map is ready!');
        this.findMyCar();

        // Now you can use all methods safely.
        this.map.addMarker({
          title: 'My car location',
          icon: {
            url: 'file:///android_asset/www/assets/images/location_5.png'
          },
          animation: 'DROP',
          position: {
            lat: this.location.lat,
            lng: this.location.lng
          }
        })
          .then(marker => {
            this.userLocation = marker;
            marker.on(GoogleMapsEvent.MARKER_CLICK)
              .subscribe(() => {

                //alert('clicked');
              });
          });

      });


  }


  openCamera() {
    console.log(this.cameraImage);
    if (this.cameraImage === null || this.cameraImage === undefined) {
      const options: CameraOptions = {
        quality: 50,
        destinationType: this.camera.DestinationType.DATA_URL,
        encodingType: this.camera.EncodingType.JPEG,
        mediaType: this.camera.MediaType.PICTURE
      }

      this.camera.getPicture(options).then((imageData) => {
        // imageData is either a base64 encoded string or a file URI
        // If it's base64:
        let base64Image = 'data:image/jpeg;base64,' + imageData;
        this.cameraImage = base64Image;

        var latLng =
          {
            'lat': this.locationPark.lat,
            'lng': this.locationPark.lng,
            'time': this.dateParking,
            'adress': this.saveCarInfo,
            'image': this.cameraImage,
            'note': this.noteInfo
          }


        this.storage.set('latlng', JSON.stringify(latLng)).then(() => {


        });


        //this.saveParkingCar({ "cameraPic": this.cameraImage }, false);

      }, (err) => {
        console.log(err);
        // Handle error
      });
    }
    else {




      let alert = this.alertCtrl.create({
        title: '',
        subTitle: '<img src="' + this.cameraImage + '" style="margin-top:10px;" class="picImage">',
        buttons: [
          {
            text: 'Dismiss',
            role: 'cancel',
            handler: () => {
              console.log('Cancel clicked');
            }
          },
          {
            text: 'Save a new picture',
            handler: () => {
              this.cameraImage = null;
              this.openCamera();
            }
          }
        ]
      });
      alert.present();

    }


  }

  findMyCar() {

    this.storage.get('latlng').then((latlngVal) => {
      latlngVal = JSON.parse(latlngVal);

      this.zone.run(() => {
        this.dateParking = latlngVal.time;
        if (latlngVal.image != undefined) {
          this.cameraImage = latlngVal.image;
        }

        if (latlngVal.note != undefined) {
          this.noteInfo = latlngVal.note;
        }


        this.saveCarInfo = latlngVal.adress;
      });

      this.locationPark = new LatLng(latlngVal.lat, latlngVal.lng);
      if (latlngVal !== undefined) {

        this.map.addMarker({
          title: 'My location',
          icon: {
            url: 'file:///android_asset/www/assets/images/carAnother.png'
          },
          animation: 'DROP',
          position: {
            lat: latlngVal.lat,
            lng: latlngVal.lng
          }
        })
          .then(marker => {
            this.carMarker = marker;
            /* marker.on(GoogleMapsEvent.MARKER_CLICK)
               .subscribe(() => {
                 //alert('clicked');
               });*/
          });


      }

    });
  }




  addMarker() {
    this.map.addMarker({
      title: 'My Marker',
      //icon: 'assets/images/location_5.png',
      icon: {
        url: 'file:///android_asset/www/assets/images/location_5.png'
      },
      animation: 'DROP',
      position: {
        lat: this.location.lat,
        lng: this.location.lng
      }
    })
      .then(marker => {
        marker.on(GoogleMapsEvent.MARKER_CLICK).subscribe(() => {

        });
      });
  }

  navigateToYourCar() {


    var text = `http://maps.google.com/?saddr=${this.location.lat},${this.location.lng}&daddr=${this.locationPark.lat},${this.locationPark.lng}`;

    window.open(text, '_blank');

  }

  createModalAlert() {

    let alert = this.alertCtrl.create({
      title: 'Save a new car park location!',
      subTitle: 'Are you sure you want to delete your last parking location and create a new one?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {
            console.log('Cancel clicked');
          }
        },
        {
          text: 'Yes',
          handler: () => {
            this.storage.clear();
            this.dateParking = null;
            this.saveCarInfo = null;
            this.cameraImage = null;
            this.noteInfo = null;
            this.saveParkingCar()
          }
        }
      ]
    });
    alert.present();


  }

  saveParkingCar() {

    if (this.saveCarInfo !== null) {
      this.createModalAlert();
    }

    else {
      if (this.carMarker !== undefined) {
        this.carMarker.remove();
      }

      this.nativeGeocoder.reverseGeocode(this.location.lat, this.location.lng)
        .then((result: NativeGeocoderReverseResult) => {
          result.administrativeArea
          this.locationPark = new LatLng(this.location.lat, this.location.lng);

          let json = result[0];

          this.dateParking = new Date();
          this.saveCarInfo = "";
          this.saveCarInfo = json["locality"] === undefined ? null : json["locality"] + " ";
          this.saveCarInfo += json["thoroughfare"] === undefined ? null : json["thoroughfare"] + " ";
          this.saveCarInfo += json["subThoroughfare"] === undefined ? null : json["subThoroughfare"];



          this.zone.run(() => this.saveCarInfo);



          this.map.addMarker({
            title: 'Location of my car',
            icon: {
              url: 'file:///android_asset/www/assets/images/carAnother.png'
            },
            animation: 'DROP',
            position: {
              lat: this.location.lat,
              lng: this.location.lng
            }
          })
            .then(marker => {
              this.carMarker = marker;
              /*
              marker.on(GoogleMapsEvent.MARKER_CLICK)
                .subscribe(() => {
                  alert('clicked');
                });*/
            });

          var latLng =
            {
              'lat': this.location.lat,
              'lng': this.location.lng,
              'time': this.dateParking,
              'adress': this.saveCarInfo
            }


          this.storage.set('latlng', JSON.stringify(latLng)).then(() => {


          });


        }
        )
        .catch((error: any) => console.log(error));
    }

  }
}