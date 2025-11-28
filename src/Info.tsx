import { useMemo } from "react";
import type { TProperties } from "./types";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, BarElement, CategoryScale, Legend, LinearScale, Title, Tooltip, type ChartOptions, type TooltipItem } from "chart.js";
import './Info.css'
interface InfoProps {
    selectProperties:  TProperties; 
}

export const Info = ({selectProperties}:InfoProps) => {
    ChartJS.register(ArcElement, Tooltip, CategoryScale, LinearScale, BarElement, Title, Legend);

    const {name, type, region, pop_t_cens, pop_u_cens, pop_r_cens, urb, pop_density, area_km2 } = selectProperties
    const chartData = useMemo(() => {
        return (
            {
                labels: [
                'Городское население', 
                'Сельское население', 
                ],
                datasets: [
                {
                    data: [selectProperties.pop_u_cens,selectProperties.pop_r_cens],
                    backgroundColor: ['#ff6200ff','#b3ff00ff'],
                    borderColor: '#ffffffff', 
                },
                ],
            }
        )
    },[selectProperties])
    const doughnutOptions: ChartOptions<'doughnut'> = useMemo(() => {
        return {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
            display: false,
            },
            tooltip: {
            enabled: true,
            callbacks: {
                label: function(context: TooltipItem<'doughnut'>): string {
                    const value = context.raw as number || 0;
                    const dataset = context.dataset;
                    const total = (dataset.data as number[]).reduce((acc: number, data: number) => acc + data, 0);
                    const percentage = Math.round((value / total) * 100);
                    return `${percentage}%`;
                }
            }
            }
        }
        }
    },[]);
    return (
        <div className="infoPanel">
            <div className="munName">
                <div>{type} {name}</div>
                <div>{region}</div>
            </div>
            <div className="backButton">X</div>
            <div className="statColumn">
                <div style={{ fontSize: '1.4rem', fontWeight: 'bold'}}>
                    Плотность населения
                </div>
                <div className="densityPanel">
                    <div style={{display: 'flex', flexDirection: 'row', fontSize: '1.4rem', fontWeight: 'bold', gap: 10}}>
                        <div style={{display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 5}}>
                            <div>
                                Население
                            </div>
                            <div style={{width: 140, height: 3, backgroundColor: 'black'}}/>
                            <div>
                                Площадь
                            </div>
                        </div>
                        <div style={{display: 'flex', flexDirection: 'column', justifyContent: 'center'}}>
                            <div>=</div>
                        </div>
                        <div style={{display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 5}}>
                            <div>
                                {pop_t_cens} чел.
                            </div>
                            <div style={{width: 120, height: 3, backgroundColor: 'black'}}/>
                            <div>
                                {area_km2.toFixed()} км²
                            </div>
                        </div>
                        <div style={{display: 'flex', flexDirection: 'column', justifyContent: 'center'}}>
                            <div>= {pop_density.toFixed(1)} чел./км²</div>
                        </div>
                    </div>
                </div>
                <div style={{ fontSize: '1.4rem', fontWeight: 'bold'}}>
                    Уровень урбанизации
                </div>
                <div className="urbPanel">

                        <div style={{ position: 'relative', width: '160px', height: '160px' }}>
                            <Doughnut id='doughnut' options={doughnutOptions} data={chartData} />
                            <div style={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            textAlign: 'center',
                            }}>
                            <div 
                                style={{ 
                                fontSize: '24px', fontWeight: 'bold', 
                                // border: '1px solid red', 
                                borderRadius: '100%', 
                                height: '60px', width: '60px', alignContent: 'center',
                                }}
                            >
                                {(urb*100).toFixed()}%
                            </div>
                            </div>
                        </div>


                    <div className="donutPanel">
                        <div className="donutPanelNum">{pop_u_cens} чел.</div>
                        <div className="donutPanelLabel">городское население</div>
                        <div className="donutPanelNum">{pop_r_cens} чел.</div>
                        <div className="donutPanelLabel">сельское население</div>
                    </div>
                </div>        
            </div>
        </div>
    )
}