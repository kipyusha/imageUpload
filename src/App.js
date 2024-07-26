import React, { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import 'tailwindcss/tailwind.css';

function App() {
  const [records, setRecords] = useState([]);
  const [currentTitle, setCurrentTitle] = useState('');
  const [currentImages, setCurrentImages] = useState([]);
  const [viewRecord, setViewRecord] = useState(null);

  useEffect(() => {
    try {
      const savedRecords = JSON.parse(localStorage.getItem('records'));
      if (savedRecords) {
        setRecords(savedRecords);
        console.log('Записи успешно загружены из localStorage:', savedRecords);
      }
    } catch (error) {
      console.error('Ошибка при загрузке записей из localStorage:', error);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('records', JSON.stringify(records));
      console.log('Записи успешно сохранены в localStorage:', records);
    } catch (error) {
      console.error('Ошибка при сохранении записей в localStorage:', error);
    }
  }, [records]);

  const onDrop = useCallback((acceptedFiles) => {
    const imagePromises = acceptedFiles.map(file => new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
      reader.readAsDataURL(file);
    }));

    Promise.all(imagePromises).then(images => {
      setCurrentImages(prevImages => [
        ...prevImages,
        ...images
      ].slice(0, 10));
    }).catch(error => console.error('Ошибка при обработке файлов:', error));
  }, []);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    multiple: true,
    maxFiles: 10,
    accept: 'image/*',
  });

  const handleSave = () => {
    if (currentTitle.trim() && currentImages.length > 0) {
      setRecords([...records, { title: currentTitle, images: currentImages }]);
      setCurrentTitle('');
      setCurrentImages([]);
      console.log('Запись сохранена:', { title: currentTitle, images: currentImages });
    } else {
      console.warn('Не удалось сохранить запись: не все поля заполнены');
    }
  };

  const handleViewRecord = (index) => {
    setViewRecord(index);
    console.log('Просмотр записи:', records[index]);
  };

  const handleDelete = (index) => {
    try {
      const updatedRecords = records.filter((_, i) => i !== index);
      setRecords(updatedRecords);
      if (viewRecord === index) {
        setViewRecord(null);
      } else if (viewRecord > index) {
        setViewRecord(viewRecord - 1);
      }
      console.log('Запись удалена:', index);
    } catch (error) {
      console.error('Ошибка при удалении записи:', error);
    }
  };

  return (
    <div className="p-4 max-w-sm mx-auto">
      {viewRecord === null ? (
        <div>
          <h1 className="text-2xl font-bold mb-4">Создать запись</h1>
          <input
            type="text"
            value={currentTitle}
            onChange={(e) => setCurrentTitle(e.target.value)}
            placeholder="Введите название записи"
            className="mt-4 block w-full text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 p-2 focus:outline-none focus:border-blue-500"
          />
          <div
            {...getRootProps({ className: 'mt-4 p-4 border border-dashed border-gray-300 rounded-lg bg-gray-50 cursor-pointer' })}
          >
            <input {...getInputProps()} />
            <p className="text-gray-500">Перетащите изображения сюда или кликните для выбора</p>
          </div>
          <button
            onClick={handleSave}
            className="mt-4 w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600"
          >
            Сохранить
          </button>
          <div className="mt-4">
            {currentImages.length > 0 && <h2 className="text-xl mb-2">Предварительный просмотр:</h2>}
            <div className="grid grid-cols-3 gap-2">
              {currentImages.map((image, index) => (
                <img
                  key={index}
                  src={image}
                  alt={`preview-${index}`}
                  className="w-full h-24 object-cover rounded-lg"
                />
              ))}
            </div>
          </div>
          <h2 className="text-xl font-bold mt-6">Записи</h2>
          <div className="mt-4">
            {records.map((record, index) => (
              <div key={index} className="mb-4">
                <h3
                  onClick={() => handleViewRecord(index)}
                  className="text-lg font-semibold cursor-pointer text-blue-500 hover:underline"
                >
                  {record.title}
                </h3>
                <button
                  onClick={() => handleDelete(index)}
                  className="text-sm text-red-500 hover:underline mt-1"
                >
                  Удалить
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div>
          <h1 className="text-2xl font-bold mb-4">{records[viewRecord].title}</h1>
          <div className="grid grid-cols-2 gap-2">
            {records[viewRecord].images.map((image, index) => (
              <img
                key={index}
                src={image}
                alt={`saved-${index}`}
                className="w-full h-40 object-cover rounded-lg"
              />
            ))}
          </div>
          <button
            onClick={() => setViewRecord(null)}
            className="mt-4 w-full bg-gray-500 text-white py-2 rounded-lg hover:bg-gray-600"
          >
            Назад
          </button>
          <button
            onClick={() => handleDelete(viewRecord)}
            className="mt-4 w-full bg-red-500 text-white py-2 rounded-lg hover:bg-red-600"
          >
            Удалить запись
          </button>
        </div>
      )}
    </div>
  );
}

export default App;


