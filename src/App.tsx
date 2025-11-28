import proj4 from 'proj4'
import { register } from 'ol/proj/proj4';
import ScaleLine from 'ol/control/ScaleLine.js';
import {defaults as defaultControls} from 'ol/control/defaults.js';
import { Feature, Map, View } from 'ol';
import { GeoJSON } from 'ol/format'
import { Vector as VectorLayer } from 'ol/layer';
import { fromLonLat, Projection, transform} from 'ol/proj';
import { Vector } from 'ol/source';
import { Style, Fill, Stroke } from 'ol/style';
import './App.css'
import { useEffect, useMemo, useRef, useState } from 'react'
import 'ol/ol.css';
import apply from 'ol-mapbox-style';
import LayerGroup from 'ol/layer/Group';
import type { FeatureLike } from 'ol/Feature';
import { type TFeature, type TGeoJSON, type TProperties } from './types';
import { Info } from './Components/Info';
import { List } from './Components/List';
import 'dotenv'
import { ScaleBar } from './Components/ScaleBar';

// custom crs definition


const apiKey = import.meta.env.VITE_API_KEY;

proj4.defs('UFO_CASSINI', '+proj=cass +lat_0=0 +lon_0=70 +x_0=0 +y_0=0 +ellps=WGS84 +units=m +no_defs')
register(proj4);
const northPole = proj4('EPSG:4326', 'UFO_CASSINI', [70, 90]);   // North Pole
const southPole = proj4('EPSG:4326', 'UFO_CASSINI', [70, -90]);  // South Pole
const farWest = proj4('EPSG:4326', 'UFO_CASSINI', [-180, 0]);    // Far west
const farEast = proj4('EPSG:4326', 'UFO_CASSINI', [180, 0]);     // Far east

// Find min/max coordinates
const minX = Math.min(farWest[0], farEast[0], -10000000);
const minY = Math.min(southPole[1], -10000000);
const maxX = Math.max(farWest[0], farEast[0], 10000000);
const maxY = Math.max(northPole[1], 10000000);

const customProjection = new Projection({
      code: 'UFO_CASSINI',
      units: 'm',
      extent: [minX, minY, maxX, maxY],
      worldExtent: [0, 0, 180, 90]
  });
const geojsonurl = new URL('./assets/umun4326_simple.geojson', import.meta.url).href;

const App = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [olMap,setOlMap] = useState<Map|null>(null)
  const [geojsonObject, setGeojsonObject] = useState<TGeoJSON|null>(null)
  const [coords,setCoords] = useState<number[]|null>(null)
  const [selectProperties, setSelectProperties] = useState<TProperties|null>(null)
  
  const items = useMemo(() => {
    if (geojsonObject) {
      const features  = geojsonObject['features']
      console.log('list: ',features)
      return features
    } 
  },[geojsonObject])

  useEffect(() => {
    const load = async () => {
      const data = await fetch(geojsonurl).then(
        (res) => res.json()
      )
      setGeojsonObject(data)
    }
    load()
  },[])
  useEffect(() => {
    if (!mapRef.current) return;

    if (customProjection) {
      console.log(customProjection)
      console.log('regged')
    }
    
    const G1 = new LayerGroup({zIndex: 0});
    const G2 = new LayerGroup({zIndex: 15});

    const map = new Map({
      target: mapRef.current,
      layers: [G1,G2],
      controls: defaultControls().extend([new ScaleLine()]),
      view: new View({
        center: fromLonLat([70, 64], customProjection), // Center on [0, 0] in WGS84
        zoom: 4.5,
        projection: customProjection,
        minZoom:4.5,
        maxZoom:9,
        extent: [-1200000, 2000000, 1200000, 9000000]
      }),
      
    });
    apply(G1, `https://api.maptiler.com/maps/019ac165-0d6f-77f4-8114-e7886839c598/style.json?key=${apiKey}`)
    apply(G2, `https://api.maptiler.com/maps/019ac16c-4029-7a3d-8c18-20f61ef54c9c/style.json?key=${apiKey}`)

    setOlMap(map)
    
    map.on('pointermove', (evt) => {
      setCoords(transform(evt.coordinate, customProjection, 'EPSG:4326'));
    }); 
    map.on('click', function(e) {
      map.forEachFeatureAtPixel(e.pixel, function(feature: FeatureLike)  {
        if (feature instanceof Feature) {
          console.log('cl: ',feature)
          const properties = feature.getProperties() as TProperties
          setSelectProperties(properties)
      } 
      }, {hitTolerance: 1})
    })
    return () => {
      map.setTarget(undefined);
    };
    
  }, []);

  // content layer init

  useEffect(() => {
    if (!geojsonObject) return
    const features = new GeoJSON().readFeatures(geojsonObject, {
        dataProjection: 'EPSG:4326',
        featureProjection: customProjection
      });

    const bracketScale = [
      { min: 0.05, max: 1, color: 'rgba(0, 139, 113, 0.8)' },
      { min: 1, max: 5, color: 'rgba(148, 255, 61, 0.8)' },
      { min: 5, max: 10, color: 'rgba(230, 254, 76, 0.8)' },
      { min: 10, max: 25, color: 'rgba(255, 196, 0, 0.8)' },
      { min: 25, max: 100, color: 'rgba(224, 101, 0, 0.8)' },   
      { min: 100, max: 2500, color: 'rgba(168, 0, 0, 0.8)' }  
    ];
    const getBracketStyle = (feature: FeatureLike) => {
      const value = feature.get('pop_density'); 
      
      
      // Find the matching bracket
      const bracket = bracketScale.find(b => value >= b.min && value < b.max);
      
      return new Style({
        fill: new Fill({
          color: bracket ? bracket.color : '#848484ff',
          
        }),
        
        // stroke: new Stroke({
        //   color: '#000000ff',
        //   width: 1
        // })
      });
    }
    const vectorSource = new Vector({ features: features });
    const vectorLayer = new VectorLayer({
      source: vectorSource,
      style: getBracketStyle
    });
    vectorLayer.setZIndex(5);
    olMap?.addLayer(vectorLayer);
    
  },[olMap, geojsonObject])

  useEffect(() => {
    if (!geojsonObject) return
    if (!selectProperties) return
    console.log('select: ',selectProperties)
    const features: TFeature[] = geojsonObject['features']
    const selectedFeature = features.find((feature) => { if (feature.properties.fid === selectProperties.fid) return feature})
    
    const selectGeojson: TGeoJSON= {...geojsonObject, features: selectedFeature ? [selectedFeature] : []}

    const fs = new GeoJSON().readFeatures(selectGeojson, {
          dataProjection: 'EPSG:4326',
          featureProjection: customProjection
        })

    const olSource = new Vector({ features: fs});

    const selectLayer = new VectorLayer({
      source: olSource,
      properties: {
        name: 'selectLayer'
      },
      style: new Style({
        fill: new Fill({
          color: 'rgba(0, 86, 166, 0.7)',
          
        }), 
        stroke: new Stroke({
          color: '#000284ff',
          width: 1
        })
      }),
      zIndex: 10
    })

    olMap?.getLayers().forEach(layer => {
      if (layer.get('name') && layer.get('name') == 'selectLayer'){
          olMap.removeLayer(layer)
      }
    });
    olMap?.addLayer(selectLayer);
    console.log(olMap?.getLayers())

  },[selectProperties, geojsonObject, olMap])

  return (
    <div style={{display: 'flex', flexDirection: 'row'}}>
      
      
      <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', width:'50dvw', position: 'relative'}}>
        <div className='titleBox'>
          <div className='mapTitle'>Карта населения Уральского Федерального Округа</div>
          <div className='mapSubtitle'>по данным переписи 2022 года</div>
        </div>
        

          {items && !selectProperties && <List items={items} setSelectProperties={setSelectProperties} />}
          {selectProperties && <Info selectProperties={selectProperties} setSelectProperties={setSelectProperties}/>}
        
      </div>

      <div 
        ref={mapRef} 
        style={{ 
          width: '50dvw', 
          height: '100dvh',
          position: 'relative'
        }} 
      >
        <ScaleBar selectProperties={selectProperties}/>
        {coords && 
          <div className="coord-box" >
            <span>{coords[1].toFixed(2)}°с.ш.</span> <span>{coords[0].toFixed(2)}°в.д.</span>
          </div>
        }
      </div>
    </div>
  );
};

export default App
