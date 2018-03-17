import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ModalController, ViewController } from 'ionic-angular';
import { Storage } from '@ionic/storage';

/**
 * Generated class for the NoteModalPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */


@Component({
  selector: 'page-note-modal',
  templateUrl: 'note-modal.html',
})
export class NoteModalPage {

  constructor(public navCtrl: NavController, public navParams: NavParams, public modalCtrl: ModalController,
    public viewCtrl: ViewController, private storage: Storage) {
  }

  public addButton: string = "add info";

  public parikngInfo = {
    'note': ''
  };
  isWhantChange: boolean = false;

  ngOnInit() {
    let noteVal = this.navParams.get('note');

    if (noteVal !== undefined && noteVal !== null) {
      // this.parikngInfo = noteVal;
      this.parikngInfo.note = noteVal;
      this.addButton = "change info";
      this.isWhantChange = true;
      console.log(noteVal);
    }


  }

  wantChange() {
    this.isWhantChange = false;
  }

  closeModal() {
    this.viewCtrl.dismiss();
  }

  closeModalWithNewNote() {
    this.viewCtrl.dismiss(this.parikngInfo);
  }

  closePopUp() {

  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ModalAddNotesPage');
  }

}
