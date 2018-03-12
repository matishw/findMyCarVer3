import { Component, ElementRef, ViewChild } from '@angular/core';
import { Platform } from "ionic-angular";
import { GoogleMaps, GoogleMap, LatLng, GoogleMapsEvent } from "@ionic-native/google-maps";
import { Geolocation } from '@ionic-native/geolocation';
@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  @ViewChild('map')
  private mapElement: ElementRef;
  private map: GoogleMap;
  private location: LatLng;

  constructor(private platform: Platform, private googleMaps: GoogleMaps, private geolocation: Geolocation) {
    this.location = new LatLng(42.346903, -71.135101);
  }

  ionViewDidLoad() {
    this.platform.ready().then(() => {

      this.geolocation.getCurrentPosition().then((resp) => {
        this.location = new LatLng(resp.coords.latitude, resp.coords.longitude)

        this.createMap();
      }).catch((error) => {
        console.log('Error getting location', error);
      });



    });
  }


  createMap() {
    let element = this.mapElement.nativeElement;
    this.map = this.googleMaps.create(element);

    this.map.one(GoogleMapsEvent.MAP_READY).then(() => {
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
      icon: 'blue',
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
}