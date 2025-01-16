import { AfterViewInit, Directive, ElementRef, EventEmitter, NgZone, OnInit, Output } from '@angular/core';
import { GoogleMapService } from '@services/google-map.service';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

declare let google: any;

export interface AddressComponent {
  long_name: string;
  short_name: string;
  types: string[];
}

export interface Address {
  address_components: AddressComponent[];
  adr_address: string;
  formatted_address: string;
  formatted_phone_number: string;
  html_attributions: string[];
  icon: string;
  id: string;
  international_phone_number: string;
  name: string;
  permanently_closed: boolean;
  place_id: string;
  price_level: number;
  rating: number;
  types: string[];
  url: string;
  utc_offset: number;
  vicinity: string;
  website: string;
}
interface Location {
  latitude: number;
  longitude: number;
}
export interface OutputAddress {
  id?: string;
  gmID?: string;
  placeID?: string;
  name?: string;
  icon?: string;
  displayAddress?: string;
  postalCode?: string;
  streetNumber?: string;
  streetName?: string;
  sublocality?: string;
  locality?: {
    short?: string;
    long?: string;
  };
  state?: {
    short?: string;
    long?: string;
  };
  country?: {
    short?: string;
    long?: string;
    isFromUSA?: boolean;
  };
  vicinity?: string;
  url?: string;
  geoLocation?: Location;
  notFound?: string;
}

@Directive({
  selector: '[appAddressAutocomplete]',
})
export class AddressAutocompleteDirective implements AfterViewInit, OnInit {
  options = {
    types: ['address'],
    fields: ['address_components', 'geometry'],
    // componentRestrictions: { country: ['us', 'ca'] },
    // componentRestrictions: { country: ['us'] },
    componentRestrictions: { country: [] },
  };
  // tslint:disable-next-line: no-output-on-prefix
  @Output() onAddressChange: EventEmitter<OutputAddress> = new EventEmitter();
  private autocomplete: any;
  private autocompleteService: any;
  private eventListener: any;
  public place!: Address;

  private searchSub$ = new Subject<string>();

  constructor(private el: ElementRef, private ngZone: NgZone, private gmp: GoogleMapService) {}

  ngOnInit() {
    this.gmp.load().then(() => {
      this.initialize();
    });

    this.searchSub$.pipe(debounceTime(500), distinctUntilChanged()).subscribe((searchValue: string) => {
      this.runZone(searchValue);
    });
  }

  ngAfterViewInit(): void {}

  private isGoogleLibExists(): boolean {
    return !(!google || !google.maps || !google.maps.places);
  }

  private initialize(): void {
    if (!this.isGoogleLibExists()) throw new Error('Google maps library can not be found');

    this.autocompleteService = new google.maps.places.AutocompleteService();

    this.autocomplete = new google.maps.places.Autocomplete(this.el.nativeElement, this.options);

    // disable browser autocomplete
    /*google.maps.event.addDomListener(this.el.nativeElement, 'focus', (e: any) =>
      e.target.setAttribute('autocomplete', 'new-address')
    );*/

    if (!this.autocomplete) throw new Error('Autocomplete is not initialized');

    if (!this.autocomplete.addListener != null) {
      this.eventListener = this.autocomplete.addListener('place_changed', () => {
        this.handleChangeEvent();
      });
    }

    this.el.nativeElement.addEventListener('keydown', (event: KeyboardEvent) => {
      if (!event.key) {
        return;
      }

      this.searchSub$.next((event.target as HTMLInputElement).value);
      const key = event.key.toLowerCase();

      if (key === 'enter' && event.target === this.el.nativeElement) {
        event.preventDefault();
        event.stopPropagation();
      }
    });

    if (window && window.navigator && window.navigator.userAgent && navigator.userAgent.match(/(iPad|iPhone|iPod)/g)) {
      setTimeout(() => {
        const containers = document.getElementsByClassName('pac-container');

        if (containers) {
          const arr = Array.from(containers);

          if (arr) {
            for (const container of arr) {
              if (!container) continue;

              container.addEventListener('touchend', (e) => {
                e.stopImmediatePropagation();
              });
            }
          }
        }
      }, 500);
    }
  }

  public reset(): void {
    this.autocomplete.setComponentRestrictions(this.options.componentRestrictions);
    this.autocomplete.setTypes(this.options.types);
    this.autocomplete.setFields(this.options.fields);
  }

  private handleChangeEvent(): void {
    this.ngZone.run(() => {
      this.place = this.autocomplete.getPlace();

      if (this.place) {
        const optAddress: OutputAddress = {
          icon: this.place.icon,
          url: this.place.url,
          placeID: this.place.place_id,
          displayAddress: this.place.formatted_address,
          name: this.place.name,
          vicinity: this.place.vicinity,
          locality: {},
          state: {},
          country: {},
          geoLocation: { latitude: -1, longitude: -1 },
        };

        if (!this.place.address_components) {
          optAddress.notFound = 'Address Not Found';
          this.onAddressChange.emit(optAddress);
          return;
        }

        // console.log(this.place);
        this.place.address_components.forEach((value) => {
          if (value.types.indexOf('street_number') > -1) {
            optAddress.streetNumber = value.short_name;
          }

          if (value.types.indexOf('route') > -1) {
            optAddress.streetName = value.long_name;
          }

          if (value.types.indexOf('postal_code') > -1) {
            optAddress.postalCode = value.short_name;
          }

          if (value.types.indexOf('sublocality') > -1) {
            optAddress.sublocality = value.long_name;
          }

          if (value.types.indexOf('locality') > -1) {
            optAddress.locality = {};
            optAddress.locality.long = value.long_name;
            optAddress.locality.short = value.short_name;
          }

          if (value.types.indexOf('administrative_area_level_1') > -1) {
            optAddress.state = {};
            optAddress.state.long = value.long_name;
            optAddress.state.short = value.short_name;
          }

          if (value.types.indexOf('country') > -1) {
            optAddress.country = {};
            optAddress.country.long = value.long_name;
            optAddress.country.short = value.short_name;
            optAddress.country.isFromUSA = value.short_name === 'US' || value.long_name === 'United States';
          }

          /*if (value.types.indexOf('administrative_area_level_3') > -1) {
            optAddress.locality = {};
            optAddress.locality.short = value.short_name;
          }*/
        });

        this.onAddressChange.emit(optAddress);
      }
    });
  }

  private runZone(value?: any) {
    this.ngZone.run(() => {
      const optAddress: OutputAddress = {};
      optAddress.notFound = 'Address Not Found';

      /*const optAddress: OutputAddress = {};
      optAddress.notFound = 'Address Not Found';
      const place = this.autocomplete.getPlace();
      if (!place) {
        this.onAddressChange.emit(optAddress);
        return;
      }*/

      this.autocompleteService.getPlacePredictions(
        {
          input: value,
          ...this.options,
        },
        (predictions: any, status: any) => {
          if (!predictions) {
            this.onAddressChange.emit(optAddress);
          }
        }
      );
    });
  }
}
