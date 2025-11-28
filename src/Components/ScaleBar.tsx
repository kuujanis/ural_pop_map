import { useMemo } from 'react';
import type { TProperties } from '../types';
import './ScaleBar.css'

interface ScaleBarProps {
    selectProperties:  TProperties|null;
}

export const ScaleBar = ({selectProperties}:ScaleBarProps) => {

    
    const flag = useMemo(() => {
        if (!selectProperties) return 'x';
        const density_value  = selectProperties.pop_density
        if (density_value<1) {
            return '1'
        }
        if (1<=density_value && density_value<5) {
            return '2'
        }
        if (5<=density_value && density_value<10) {
            return '3'
        }
        if (10<=density_value && density_value<25) {
            return '4'
        }
        if (25<=density_value && density_value<100) {
            return '5'
        }
        if (100<=density_value && density_value<2500) {
            return '6'
        }

    },[selectProperties])

    return (
              <div className='scale-container'>
                <div  className='scale-wrapper'>
                    <div className='scale-colors'>
                        <div style={{backgroundColor: 'rgba(0, 139, 113, 0.8)', border: flag==='1' ? '3px solid #000284ff' : '1px solid white'}} />
                        <div style={{backgroundColor: 'rgba(148, 255, 61, 0.8)', border: flag==='2' ? '3px solid #000284ff' : '1px solid white'}} />
                        <div style={{backgroundColor: 'rgba(230, 254, 76, 0.8)', border: flag==='3' ? '3px solid #000284ff' : '1px solid white'}} />
                        <div style={{backgroundColor: 'rgba(255, 196, 0, 0.8)', border: flag==='4' ? '3px solid #000284ff' : '1px solid white'}} />
                        <div style={{backgroundColor: 'rgba(224, 101, 0, 0.8)', border: flag==='5' ? '3px solid #000284ff' : '1px solid white'}} />
                        <div style={{backgroundColor: 'rgba(168, 0, 0, 0.8)', border: flag==='6' ? '3px solid #000284ff' : '1px solid white'}} />
                    </div>
                    <div className='scale-tab'>            
                        <div>2500</div>
                        <div>100</div>
                        <div>25</div>
                        <div>10</div>
                        <div>5</div>
                        <div>1</div>
                        <div>0</div>
                    </div>
                </div>
                <div>
                    чел/км²
                </div>
              </div>        
    )
}