package com.korea.movie_reservation.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.korea.movie_reservation.mapper.ReservationMapper;
import com.korea.movie_reservation.vo.ReservationVO;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ReservationService {

    private final ReservationMapper reservationMapper;

    public int insertReservation(ReservationVO reservationVO) {
        return reservationMapper.insertReservation(reservationVO);
    }

    public int updateReservation(ReservationVO reservationVO) {
        return reservationMapper.updateReservation(reservationVO);
    }

    public List<ReservationVO> findReservationDetails() {
        return reservationMapper.findReservationDetails();
    }
}