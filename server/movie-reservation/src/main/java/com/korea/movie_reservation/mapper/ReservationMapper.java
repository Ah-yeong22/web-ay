package com.korea.movie_reservation.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;

import com.korea.movie_reservation.vo.ReservationVO;

@Mapper
public interface ReservationMapper {

	int insertReservation(ReservationVO reservationVO);
	
	int updateReservation(ReservationVO reservationVO);
	
	List<ReservationVO> findReservationDetails();
}
