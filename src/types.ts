import type { GeoJSONGeometry } from "ol/format/GeoJSON"

export type TProperties = {
        fid: number;
        name: string;
        type: string,
        region: string;
        area_km2: number;
        pop_density: number;
        pop_t_cens: number;
        pop_u_cens: number;
        pop_r_cens: number;
        urb: number;
    }
export type TFeature = {
    "type": string,
    "properties": TProperties,
    "geometry": GeoJSONGeometry
}
export type TGeoJSON = {
    "type": string,
    "name": string,
    "crs": { "type": string, "properties": { "name": string } },
    "features": TFeature[]
}