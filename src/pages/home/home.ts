import { Component, ElementRef, ViewChild } from '@angular/core';
import { Platform } from "ionic-angular";
import { GoogleMaps, GoogleMap, LatLng, GoogleMapsEvent, GoogleMapOptions } from "@ionic-native/google-maps";
import { Geolocation } from '@ionic-native/geolocation';
import { NativeGeocoder, NativeGeocoderReverseResult, NativeGeocoderForwardResult } from '@ionic-native/native-geocoder';
@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  @ViewChild('map')
  private mapElement: ElementRef;
  private map: GoogleMap;
  private location: LatLng;
  saveCarInfo:string;
  constructor(private platform: Platform, private googleMaps: GoogleMaps, private geolocation: Geolocation,
    private nativeGeocoder: NativeGeocoder) {
    this.location = new LatLng(42.346903, -71.135101);
  }

  ionViewDidLoad() {
    //this.createMap();
    
    this.platform.ready().then(() => {
      
      this.geolocation.getCurrentPosition().then((resp) => {
        this.location = new LatLng(resp.coords.latitude, resp.coords.longitude);
        
        this.loadMap();
        
      }).catch((error) => {
        console.log('Error getting location', error);
      });



    });
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

        // Now you can use all methods safely.
        this.map.addMarker({
            title: 'Ionic',
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
            marker.on(GoogleMapsEvent.MARKER_CLICK)
              .subscribe(() => {
                alert('clicked');
              });
          });

      });
  }


  createMap() {
    //let element = this.mapElement.nativeElement;
    
    this.map = GoogleMaps.create('map_canvas');;

    this.map.one(GoogleMapsEvent.MAP_READY).then(() => {
      console.log("Event")
      let options = {
        target: this.location,
        zoom: 8
      };

      this.map.moveCamera(options);
      setTimeout(() => { this.addMarker() }, 2000);
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
          alert('Marker Clicked');
        });
      });
  }


  saveParkingCar(){
        this.nativeGeocoder.reverseGeocode(52.5072095, 13.1452818)
      .then((result: NativeGeocoderReverseResult) => 
      
      this.saveCarInfo = JSON.stringify(result)
      //console.log(JSON.stringify(result))
    
    
    
    )
      .catch((error: any) => console.log(error));
  }
}