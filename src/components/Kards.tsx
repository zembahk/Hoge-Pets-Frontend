import React from 'react';
import './Kards.css'
import { CONTRACT } from './info'

type Props = {
    bambooAmount: number;
    count: number;
    loaded: boolean;
    tokenIds: Map<number, [any]> | undefined;
    names: Map<number, [any]> | undefined;
}

export const Kards: React.FC<Props> = ({
    bambooAmount,
    count,
    loaded,
    tokenIds,
    names,
}) => {
    
    const[render, setRender] = React.useState<React.ReactElement[]>()
   
    React.useEffect(() => {
        const rendered: React.ReactElement[]= [];
    if (loaded && tokenIds !== undefined ) {
        //console.log(tokenIds)
        tokenIds.forEach((value, key) => {   
                const attribute = new Traits()
                setTraits(value, attribute)
                let name
                if (names !== undefined) {
                    name = names.get(key)
                }
                const iconDiv = createIconDiv(attribute, bambooAmount)
                let keyImage = JSON.parse(JSON.stringify(tokenIds.get(key)))?.image
                const component = createKomponent(key,keyImage, name?.toString(), iconDiv, attribute)
                rendered.push(component);
        })
        setRender(rendered)
        //console.log(count)
    } 
    
},[loaded, names, tokenIds, count, bambooAmount])
return <div className='CardBox'>{render}</div>
}

class Traits {
    animation_url: any
    audio: any
    description: any
    image: any
    title: any
}

const setTraits =(value: [any], attribute: Traits) => {
    if (!value) { return }
    const data = JSON.parse(JSON.stringify(value))
    if (data.animation_url !== undefined ) { 
        attribute.animation_url = data.animation_url
        attribute.description = data.description
         attribute.audio = data.audio
        attribute.image = data.image
        attribute.title = data.title
    }                     
}

const createKomponent = (key: number, keyImage: string | undefined, name?:string, iconDiv?: JSX.Element | undefined, data?: Traits) => {
    const openseaLink = "https://opensea.io/assets/matic/" + CONTRACT + "/" + key

    const component = React.createElement("div", {key: key, className: 'Card' },
        <div className='flip-card'>
            <div className='card-front'>
                <div className='img-bg'></div>
                <figure className='CardImageFrame'>
                
                    <img className='CardImage img-fluid'src={keyImage} alt={keyImage} />
                </figure>
                <div className='CardTitle'>
                    #{key}
                </div>
                <span className='CardFrontBody'>
                    {name}
                </span>
            </div>
            <div className='card-back'>
                <div className='CardBackBody'>
                    <div className='CardSubtitle'>
                        {iconDiv}
                        <br/>
                        {data?.description}   
                        <br/>                   
                    </div>
                    
                    <div className='ButtonBox'>
                        <button className='inspect' onClick={(e: { preventDefault: () => void; }) => 
                            { e.preventDefault(); window.open(
                                openseaLink,
                                '_blank' // <- This is what makes it open in a new window.
                            ); }}>
                            OpenSea.io</button>
                    </div>
                </div>
            </div>
        </div>    
    )
    return component
}

export default Kards

function createIconDiv(attribute: Traits, bambooAmount: number) {
    if (attribute.image !== undefined) {
        return (
            <div className='icons'>
                {attribute.title}
                <br/>
                {attribute.title === 'Bamboo' ? <small>Amount : {bambooAmount} </small> : <></>}
            </div>
        )
    }
}

