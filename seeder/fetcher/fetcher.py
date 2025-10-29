from selenium import webdriver
from selenium.webdriver.firefox.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from time import sleep
import json
import re

def main():
    file_name = "sorties-nature"
    url = 'https://www.cotesdarmor.com/agenda/sorties-nature/'

    service = Service('./geckodriver')
    driver = webdriver.Firefox(service=service)
    wait = WebDriverWait(driver, 10)  # Add explicit wait for better reliability
    driver.get(url)

    # Wait for result counter to be present instead of fixed sleep
    counter_element = wait.until(EC.presence_of_element_located((By.CLASS_NAME, 'result-counter')))
    counter = int(counter_element.text.split(' ')[0])
    
    plage_buttons = driver.find_elements(By.CLASS_NAME, 'list-item')
    first_button = plage_buttons[0]
    first_button.click()
    
    # Wait for content to load instead of fixed sleep
    wait.until(EC.presence_of_element_located((By.CLASS_NAME, 'diffusio-centerer')))

    data = []

    # next_button = driver.find_element(By.CLASS_NAME, 'no-button')
    next_button = driver.find_element(By.XPATH, '/html/body/div[1]/section[2]/div/div/div/div/div/div/div[2]/div/div[2]/div[1]/div/div[3]/ul/li[3]/button')

    for i in range(counter):
        try:
            plage_data = {}

            # Wait for container to be present
            data_container = wait.until(EC.presence_of_element_located((By.CLASS_NAME, 'diffusio-centerer')))

            # Images - use list comprehension for efficiency
            try:
                images_container = data_container.find_element(By.CLASS_NAME, 'dsio-detail--photos')
                images = images_container.find_elements(By.TAG_NAME, 'img')
                plage_data['images'] = [img.get_attribute('src') for img in images]
            except Exception:
                print('No images found')
                plage_data['images'] = []

            # Title
            title = data_container.find_element(By.TAG_NAME, 'h1')
            print(title.text)
            plage_data['title'] = title.text

            # Description
            try:
                description = data_container.find_element(By.XPATH, "/html/body/div[1]/section[2]/div/div/div/div/div/div/div[2]/div/div[2]/div[2]/div/div[1]/div/div[3]/div[2]/div[1]/p")
                print(description.text)
                plage_data['description'] = description.text
            except Exception:
                print('No description found')
                plage_data['description'] = ''

            # Location
            try:
                location = data_container.find_element(By.XPATH, "/html/body/div[1]/section[2]/div/div/div/div/div/div/div[2]/div/div[2]/div[2]/div/div[1]/div/div[3]/div[2]/div[2]/div/div/p[1]/span[2]")
                print(location.text)
                plage_data['location'] = location.text
            except Exception:
                print('No location found')
                plage_data['location'] = ''

            # Links - pre-compile regex for performance
            coordinate_pattern = re.compile(r'(-?\d+\.\d+),(-?\d+\.\d+)')
            sidebar = data_container.find_element(By.CLASS_NAME, 'dsio-detail--sidebar')
            sidebar_links = sidebar.find_elements(By.TAG_NAME, 'a')
            
            # Initialize coordinates to avoid setting them multiple times
            coords_set = False

            for link in sidebar_links:
                link_text = link.text
                link_href = link.get_attribute('href')
                
                if link_text == 'E-mail':
                    print(link_href)
                    plage_data['email'] = link_href
                elif link_text == 'Site internet':
                    print(link_href)
                    plage_data['website'] = link_href
                elif not coords_set:
                    match = coordinate_pattern.search(link_href)
                    if match:
                        latitude, longitude = match.groups()
                        print(f'Latitude: {latitude}, Longitude: {longitude}')
                        plage_data['latitude'] = latitude
                        plage_data['longitude'] = longitude
                        coords_set = True
            
            # Set default empty coordinates if not found
            if not coords_set:
                print('No coordinates found')
                plage_data['latitude'] = ''
                plage_data['longitude'] = ''

            data.append(plage_data)

            # Save data to a file every 5 items with proper error handling
            if i % 5 == 0:
                try:
                    with open(f'data/{file_name}.json', 'w', encoding='utf-8') as file:
                        json.dump(data, file, ensure_ascii=False, indent=2)
                except Exception as e:
                    print(f'Error saving intermediate data: {e}')
        except Exception as e:
            print(f'No data found: {e}')

        next_button.click()
        # Wait for next page to load before continuing
        sleep(0.5)  # Reduced from 1 second

    # Save final data to a file
    try:
        with open(f'data/{file_name}.json', 'w', encoding='utf-8') as file:
            json.dump(data, file, ensure_ascii=False, indent=2)
    except Exception as e:
        print(f'Error saving final data: {e}')

    driver.quit()

if __name__ == '__main__':
    main()
