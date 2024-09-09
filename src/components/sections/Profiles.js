import '../styles/Profiles.css';    
import image1 from '../images/image1.jpg';
import image2 from '../images/image2.jpg';
import image3 from '../images/image3.jpeg';
import image4 from '../images/image4.jpeg';

export const Profiles = () => {
    return (
        <div className='profiles'>
            <div className='profile_div'>
                <img src={image1} alt='Profile 1' className='profile_pic'/>
                <p className='profile_tag'>Bobby</p>
            </div>
            <div className='profile_div'>
                <img src={image2} alt='Profile 2' className='profile_pic'/>
                <p className='profile_tag'>Tommy</p>
            </div>
            <div className='profile_div'>
                <img src={image3} alt='Profile 3' className='profile_pic'/>
                <p className='profile_tag'>Jasmine</p>
            </div>
            <div className='profile_div'>
                <img src={image4} alt='Profile 4' className='profile_pic'/>
                <p className='profile_tag'>Harry</p>
            </div>
        </div>
    )
}
