'use client';

import { createStudy } from '@/lib/api/study/create';
import { Camera, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import musicBunny from '@/assets/images/music-bunny.svg';
import CategoriesModal from '../common/CategoriesModal';
import { categoryFormatting } from '@/utils/categoryFormatting';
import { studyTypeFormatting } from '@/utils/studyTypeFormatting';
import OnlineModal from '../common/OnlineModal';
import RegionModal from '../common/RegionModal';
import { toast } from 'react-toastify';
import { useStudiesStore } from '@/stores/useStudiesStore';
import { userAuthStore } from '@/stores/userStore';

type CreateStudyModalProps = {
  onClose: () => void;
};

export default function CreateStudyModal({ onClose }: CreateStudyModalProps) {
  // const [personCount, setPersonCount] = useState<number | ''>('');
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [capacity, setCapacity] = useState<number | ''>('');
  const [studyType, setStudyType] = useState('');
  const [location, setLocation] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [introduction, setIntroduction] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isOpenCategoryModal, setIsOpenCategoryModal] = useState(false);
  const [isOpenRegionModal, setIsOpenRegionModal] = useState(false);
  const [isOpenStudyTypeModal, setIsOpenStudyTypeModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const addStudy = useStudiesStore((state) => state.addStudy);
  const me = userAuthStore((state) => state.user);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file); // 실제 전송용
      setImagePreview(URL.createObjectURL(file)); // 미리보기용
    }
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    const formData = new FormData();

    const requestPayload = {
      name,
      category,
      capacity,
      studyType,
      location,
      startDate: new Date(startDate).toISOString(),
      endDate: new Date(endDate).toISOString(),
      introduction,
    };

    formData.append('request', JSON.stringify(requestPayload));

    if (imageFile) {
      formData.append('image', imageFile);
    }

    try {
      const data = await createStudy(formData);
      const newStudy: StudiesMainType = {
        studyId: data.data,
        name: name,
        leaderNickname: me?.nickname,
        capacity: Number(capacity),
        currentCount: 1,
        startDate: new Date(startDate).toISOString(),
        endDate: new Date(endDate).toISOString(),
        imageUrl: imagePreview ?? null,
        introduction: introduction,
        category: category,
        studyType: studyType,
        finished: false,
      };

      addStudy(newStudy);
      toast.success('스터디 생성이 완료되었습니다!');
      onClose();
    } catch (error) {
      console.error('응답 에러:', error);
      toast.error('스터디 생성 중 오류가 발생하였습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className='flex flex-col gap-4 '>
        <div className='relative w-fit mx-auto my-10'>
          <input
            type='file'
            accept='image/*'
            id='imageUpload'
            onChange={handleImageChange}
            hidden
          />

          <label htmlFor='imageUpload' className='cursor-pointer'>
            <div
              className='w-20 h-20 lg:w-25 lg:h-25 rounded-full bg-gray-300 bg-cover bg-center'
              style={{
                backgroundImage: imagePreview
                  ? `url(${imagePreview})`
                  : musicBunny,
              }}
            ></div>
            <div className='w-[25px] h-[25px] lg:w-[30px] lg:h-[30px] rounded-full bg-[#111111] absolute bottom-0 right-0 flex justify-center items-center'>
              <Camera color='#FFFFFF' size={18} />
            </div>
          </label>
        </div>

        <div className='flex flex-col w-full'>
          <div>
            <span className='t3 mb-2.5'>스터디명 </span>
            <span className='tm5 text-red'>(필수)</span>
          </div>
          <input
            className='w-full input-type2 mt-3'
            placeholder='스터디명을 입력해 주세요'
            style={{ borderColor: 'var(--color-border3)' }}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className='flex flex-col gap-3 lg:flex-row'>
          {/* 시작 날짜 */}
          <div className='flex flex-col w-full'>
            <div>
              <span className='t3 mb-2.5'>시작 날짜 </span>
              <span className='tm5 text-red'>(필수)</span>
            </div>
            <input
              type='date'
              className='w-full input-type2 mt-3'
              style={{ borderColor: 'var(--color-border3)' }}
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
            />
          </div>

          {/* 종료 날짜 */}
          <div className='flex flex-col w-full'>
            <div>
              <span className='t3 mb-2.5'>종료 날짜 </span>
              <span className='tm5 text-red'>(필수)</span>
            </div>
            <input
              type='date'
              className='w-full input-type2 mt-3'
              style={{ borderColor: 'var(--color-border3)' }}
              value={endDate}
              min={startDate || new Date().toISOString().split('T')[0]}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>

        <div className='flex flex-col w-full'>
          <div>
            <span className='tm-0 mb-2.5'>인원 수 </span>
            <span className='tm5 text-red'>(필수)</span>
          </div>
          <div className='flex w-full gap-3 items-end'>
            <input
              type='text'
              inputMode='numeric'
              pattern='[0-9]*'
              style={{ borderColor: 'var(--color-border3)' }}
              className='w-full input-type2 mt-3'
              name='capacity'
              placeholder='인원 수를 입력해 주세요'
              value={capacity === '' ? '' : String(capacity)}
              onChange={(e) => {
                const input = e.target.value;

                const onlyNums = input.replace(/[^0-9]/g, '');

                if (onlyNums === '') {
                  setCapacity('');
                  return;
                }

                const parsed = String(Number(onlyNums));

                // 최대 1000 제한
                if (Number(parsed) > 1000 || Number(parsed) <= 0) return;

                setCapacity(Number(parsed));
              }}
            />

            <span className='tm4 shrink-0 mt-3'>명</span>
          </div>
        </div>
        {/* 카테고리 */}
        <div className=' shrink-0'>
          <p className='t3 mb-3'>
            카테고리 <span className='tm5 text-red'>(필수)</span>
          </p>
          <div
            className='w-full relative input-type2 border-[1px] mt-3'
            style={{ borderColor: 'var(--color-border3)' }}
          >
            <button
              className={`w-full h-full text-left ${
                !category ? 'text-gray-400' : 'text-black'
              }`}
              onClick={(e) => {
                e.preventDefault();
                setIsOpenCategoryModal((prev) => !prev);
              }}
            >
              {category
                ? categoryFormatting(category)
                : '카테고리를 선택해 주세요'}
            </button>
            <div className='absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none'>
              <ChevronDown className='w-4 h-4 lg:w-6 lg:h-6' />
            </div>
            {isOpenCategoryModal && (
              <div className='absolute top-full w-full left-0 z-1'>
                <CategoriesModal
                  onSelect={(category: string) => {
                    setCategory(category);
                    setIsOpenCategoryModal(false);
                  }}
                  customCss='!w-full !h-[120px] !overflow-auto t4'
                />
              </div>
            )}
          </div>
        </div>

        <div className='flex flex-col gap-3 lg:flex-row shrink-0'>
          <div className='flex flex-col w-full'>
            <div>
              <span className='t3 mb-2.5'>진행 방식</span>
              <span className='tm5 text-red'>(필수)</span>
            </div>

            <div className='flex flex-col gap-3 lg:flex-row'>
              <div
                className='w-full relative input-type2 border-[1px] mt-3'
                style={{ borderColor: 'var(--color-border3)' }}
              >
                <button
                  className={`w-full h-full text-left ${
                    !studyType ? 'text-gray-400' : 'text-black'
                  }`}
                  onClick={(e) => {
                    e.preventDefault();
                    setIsOpenStudyTypeModal((prev) => !prev);
                  }}
                >
                  {studyType
                    ? studyTypeFormatting(studyType)
                    : '진행 방식을 선택해 주세요'}{' '}
                </button>
                <div className='absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none'>
                  <ChevronDown className='w-4 h-4 lg:w-6 lg:h-6' />
                </div>
                {isOpenStudyTypeModal && (
                  <div className='absolute top-full w-full left-0 z-1'>
                    <OnlineModal
                      onSelect={(online: string) => {
                        setStudyType(online);
                        setIsOpenStudyTypeModal(false);
                      }}
                      customCss='!w-full !h-[120px] !overflow-auto t4'
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {studyType !== 'ONLINE' && (
            <div className='flex flex-col w-full'>
              <div>
                <span className='t3 mb-2.5'>지역</span>
              </div>
              <div
                className='w-full relative input-type2 border-[1px] mt-3'
                style={{ borderColor: 'var(--color-border3)' }}
              >
                <button
                  className={`w-full h-full text-left ${
                    !location ? 'text-gray-400' : 'text-black'
                  }`}
                  onClick={(e) => {
                    e.preventDefault();
                    setIsOpenRegionModal((prev) => !prev);
                  }}
                >
                  {location ? location : '지역을 선택해 주세요'}{' '}
                </button>
                <div className='absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none'>
                  <ChevronDown className='w-4 h-4 lg:w-6 lg:h-6' />
                </div>
                {isOpenRegionModal && (
                  <div className='absolute top-full w-full left-0 z-1'>
                    <RegionModal
                      onSelect={(location: string | null) => {
                        if (location === null) return;
                        setLocation(location);
                        setIsOpenRegionModal(false);
                      }}
                      selectedRegion={location}
                      customCss='!w-full !h-[120px] !overflow-auto t4'
                    />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className='flex flex-col w-full mt-3'>
          <span className='t3'>스터디 한 줄 소개</span>
          <textarea
            className='input-type2 py-3 resize-none w-full h-[90px]! mt-3'
            placeholder='스터디 한 줄 소개를 입력해 주세요'
            style={{ borderColor: 'var(--color-border3)' }}
            value={introduction}
            onChange={(e) => setIntroduction(e.target.value)}
          />
        </div>

        <button
          className='button-modal1 hover:bg-[#292929]'
          onClick={handleSubmit}
          disabled={
            isSubmitting ||
            name === '' ||
            startDate === '' ||
            endDate === '' ||
            category === '' ||
            capacity === '' ||
            studyType === ''
          }
        >
          등록
        </button>
      </div>
    </>
  );
}
