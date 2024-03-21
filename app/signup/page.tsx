"use client"
import Link from 'next/link'
import '../(styles)/signup.css'
import React, { ChangeEvent, FormEvent, useState, ChangeEventHandler } from 'react';

interface FormData {
    email:string,
    username:string,
    password:string,
    occupation:string,
    hobbies:string[],
    bio:string,
    interests:string,
    location:string,
    sex:string,
    age:number,
}
export default function Signup() {
    const [formData,setFormData] = useState<FormData>({
        email:'',
        username:'',
        password:'',
        occupation:'',
        hobbies:[],
        bio:'',
        interests:'',
        location:'United States of America',
        sex:'male',
        age:0,
    })

    const country_list = [
        "Canada",
        "United Kingdom",
        "Afghanistan",
        "Albania",
        "Algeria",
        "American Samoa",
        "Andorra",
        "Angola",
        "Anguilla",
        "Antarctica",
        "Antigua and Barbuda",
        "Argentina",
        "Armenia",
        "Aruba",
        "Australia",
        "Austria",
        "Azerbaijan",
        "Bahamas",
        "Bahrain",
        "Bangladesh",
        "Barbados",
        "Belarus",
        "Belgium",
        "Belize",
        "Benin",
        "Bermuda",
        "Bhutan",
        "Bolivia (Plurinational State of)",
        "Bonaire, Sint Eustatius and Saba",
        "Bosnia and Herzegovina",
        "Botswana",
        "Bouvet Island",
        "Brazil",
        "British Indian Ocean Territory",
        "Brunei Darussalam",
        "Bulgaria",
        "Burkina Faso",
        "Burundi",
        "Cabo Verde",
        "Cambodia",
        "Cameroon",
        "Cayman Islands",
        "Central African Republic",
        "Chad",
        "Chile",
        "China",
        "Christmas Island",
        "Cocos (Keeling) Islands",
        "Colombia",
        "Comoros",
        "Congo (the Democratic Republic of the)",
        "Congo",
        "Cook Islands",
        "Costa Rica",
        "Croatia",
        "Cuba",
        "Curaçao",
        "Cyprus",
        "Czechia",
        "Côte d'Ivoire",
        "Denmark",
        "Djibouti",
        "Dominica",
        "Dominican Republic",
        "Ecuador",
        "Egypt",
        "El Salvador",
        "Equatorial Guinea",
        "Eritrea",
        "Estonia",
        "Eswatini",
        "Ethiopia",
        "Falkland Islands [Malvinas]",
        "Faroe Islands",
        "Fiji",
        "Finland",
        "France",
        "French Guiana",
        "French Polynesia",
        "French Southern Territories",
        "Gabon",
        "Gambia",
        "Georgia",
        "Germany",
        "Ghana",
        "Gibraltar",
        "Greece",
        "Greenland",
        "Grenada",
        "Guadeloupe",
        "Guam",
        "Guatemala",
        "Guernsey",
        "Guinea",
        "Guinea-Bissau",
        "Guyana",
        "Haiti",
        "Heard Island and McDonald Islands",
        "Holy See",
        "Honduras",
        "Hong Kong",
        "Hungary",
        "Iceland",
        "India",
        "Indonesia",
        "Iran (Islamic Republic of)",
        "Iraq",
        "Ireland",
        "Isle of Man",
        "Israel",
        "Italy",
        "Jamaica",
        "Japan",
        "Jersey",
        "Jordan",
        "Kazakhstan",
        "Kenya",
        "Kiribati",
        "Korea (the Democratic People's Republic of)",
        "Korea (the Republic of)",
        "Kuwait",
        "Kyrgyzstan",
        "Lao People's Democratic Republic",
        "Latvia",
        "Lebanon",
        "Lesotho",
        "Liberia",
        "Libya",
        "Liechtenstein",
        "Lithuania",
        "Luxembourg",
        "Macao",
        "Madagascar",
        "Malawi",
        "Malaysia",
        "Maldives",
        "Mali",
        "Malta",
        "Marshall Islands",
        "Martinique",
        "Mauritania",
        "Mauritius",
        "Mayotte",
        "Mexico",
        "Micronesia (Federated States of)",
        "Moldova (the Republic of)",
        "Monaco",
        "Mongolia",
        "Montenegro",
        "Montserrat",
        "Morocco",
        "Mozambique",
        "Myanmar",
        "Namibia",
        "Nauru",
        "Nepal",
        "Netherlands",
        "New Caledonia",
        "New Zealand",
        "Nicaragua",
        "Niger",
        "Nigeria",
        "Niue",
        "Norfolk Island",
        "Northern Mariana Islands",
        "Norway",
        "Oman",
        "Pakistan",
        "Palau",
        "Palestine, State of",
        "Panama",
        "Papua New Guinea",
        "Paraguay",
        "Peru",
        "Philippines",
        "Pitcairn",
        "Poland",
        "Portugal",
        "Puerto Rico",
        "Qatar",
        "Republic of North Macedonia",
        "Romania",
        "Russian Federation",
        "Rwanda",
        "Réunion",
        "Saint Barthélemy",
        "Saint Helena, Ascension and Tristan da Cunha",
        "Saint Kitts and Nevis",
        "Saint Lucia",
        "Saint Martin (French part)",
        "Saint Pierre and Miquelon",
        "Saint Vincent and the Grenadines",
        "Samoa",
        "San Marino",
        "Sao Tome and Principe",
        "Saudi Arabia",
        "Senegal",
        "Serbia",
        "Seychelles",
        "Sierra Leone",
        "Singapore",
        "Sint Maarten (Dutch part)",
        "Slovakia",
        "Slovenia",
        "Solomon Islands",
        "Somalia",
        "South Africa",
        "South Georgia and the South Sandwich Islands",
        "South Sudan",
        "Spain",
        "Sri Lanka",
        "Sudan",
        "Suriname",
        "Svalbard and Jan Mayen",
        "Sweden",
        "Switzerland",
        "Syrian Arab Republic",
        "Taiwan",
        "Tajikistan",
        "Tanzania, United Republic of",
        "Thailand",
        "Timor-Leste",
        "Togo",
        "Tokelau",
        "Tonga",
        "Trinidad and Tobago",
        "Tunisia",
        "Turkey",
        "Turkmenistan",
        "Turks and Caicos Islands",
        "Tuvalu",
        "Uganda",
        "Ukraine",
        "United Arab Emirates",
        "United States Minor Outlying Islands",
        "Uruguay",
        "Uzbekistan",
        "Vanuatu",
        "Venezuela (Bolivarian Republic of)",
        "VietNam",
        "Virgin Islands (British)",
        "Virgin Islands (U.S.)",
        "Wallis and Futuna",
        "Western Sahara",
        "Yemen",
        "Zambia",
        "Zimbabwe",
        "Åland Islands"
    ];
    
    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        console.log(formData); 
        const res = await fetch('/api/v1/Signup', {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(formData)
        });

        if(!res.ok){
            throw new Error('failed to create')
        }
    }

    function handleChange(event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>): void {
        const { value, name } = event.target;
        if (name === 'hobbies') {
            const hobbies = value
            .split(',')
            .map(hobby => hobby.trim())

            setFormData(prev => ({
                ...prev,
                hobbies: hobbies,
            }));
        } else if (name === 'age') {
            const age = parseInt(value);
            setFormData(prev => ({
                ...prev,
                age: isNaN(age) ? 0 : age, 
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value,
            }));
        }

    }

    return (
        <div>
            <form onSubmit={handleSubmit}>
                <label htmlFor="email">*Email Address:</label>
                <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} required />
                
                <label htmlFor="username">*Username:</label>
                <input type="text" id="username" name="username" value={formData.username} onChange={handleChange} required />
                
                <label htmlFor="password">*Password:</label>
                <input type="password" id="password" name="password" value={formData.password} onChange={handleChange} required />
                
                <label htmlFor="occupation">Occupation:</label>
                <input type="text" id="occupation" name="occupation" value={formData.occupation} onChange={handleChange}/>
                
                <label htmlFor="hobbies">Enter your hobbies (separated by commas):</label>
                <textarea id="hobbies" name="hobbies" value={formData.hobbies} onChange={handleChange}></textarea>
                
                <label htmlFor="bio">Tell everyone about yourself:</label>
                <textarea id="bio" name="bio" value={formData.bio} onChange={handleChange}></textarea>
                
                <label htmlFor="interests">Things you are interested in!:</label>
                <textarea id="interests" name="interests" value={formData.interests} onChange={handleChange}></textarea>

                <select id="location" name="location" value={formData.location} onChange={handleChange}>
                 <option value="United States of America">United States of America</option>
                 {country_list.map(country => (
                  <option key={country} value={country}>{country}</option>
                  ))}
                </select>
                <label htmlFor="sex">Sex:</label>
                <select id="sex" name="sex" value={formData.sex} onChange={handleChange} >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                </select>
                
                <label htmlFor="age">Age:</label>
                <input type="number" id="age" name="age"  value={formData.age === 0 ? '' : formData.age} onChange={handleChange}/>
                
                {/* <label htmlFor="picture">Profile Picture:</label>
                <input type="file" accept='image/jpeg, image/png ,image/jpg' /> */}

                <button type="submit">Sign up!</button>
                <p>* Required fields</p>

            </form>
            <p>Have an account? <Link href="/login">Log In</Link></p>
        </div>
    );
}

//   profilePic: { type: Buffer },



