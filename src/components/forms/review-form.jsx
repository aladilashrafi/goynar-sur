import React,{useEffect,useState} from "react";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import { useSelector } from "react-redux";
import { Rating } from "react-simple-star-rating";
import * as Yup from "yup";
// internal
import ErrorMsg from "../common/error-msg";
import { useAddReviewMutation } from "@/redux/features/reviewApi";
import { notifyError, notifySuccess } from "@/utils/toast";

// schema
const schema = Yup.object().shape({
  comment: Yup.string().required().label("Comment"),
});

const ReviewForm = ({ product_id }) => {
  const { accessToken, user } = useSelector((state) => state.auth);
  const [rating, setRating] = useState(0);
  const [addReview, { isLoading }] = useAddReviewMutation();

  // Catch Rating value
  const handleRating = (rate) => {
    setRating(rate)
  }

   // react hook form
   const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm({
    resolver: yupResolver(schema),
  });

  useEffect(() => {
    if (user?.name) setValue("name", user.name);
    if (user?.email) setValue("email", user.email);
  }, [setValue, user]);

  // on submit
  const onSubmit = async (data) => {
    if(!accessToken || !user){
      notifyError("Please login to review this product.");
      return;
    }

    if (!rating) {
      notifyError("Please select a rating.");
      return;
    }

    try {
      const result = await addReview({
        productId: product_id,
        rating,
        comment: data.comment,
      }).unwrap();
      notifySuccess(result?.message || "Review submitted.");
      reset({ comment: "", name: user?.name || "", email: user?.email || "" });
      setRating(0);
    } catch (error) {
      notifyError(error?.data?.message || error?.message || "Unable to submit review.");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="tp-product-details-review-form-rating d-flex align-items-center">
        <p>Your Rating :</p>
        <div className="tp-product-details-review-form-rating-icon d-flex align-items-center">
          <Rating onClick={handleRating} size={16} initialValue={rating} />
        </div>
      </div>
      {!accessToken && (
        <p className="mb-25">Please login and make sure you purchased this product before submitting a review.</p>
      )}
      <div className="tp-product-details-review-input-wrapper">
        <div className="tp-product-details-review-input-box">
          <div className="tp-product-details-review-input">
            <textarea
            {...register("comment", { required: `Comment is required!` })}
              id="comment"
              name="comment"
              placeholder="Write your review here..."
            />
          </div>
          <div className="tp-product-details-review-input-title">
            <label htmlFor="msg">Your Review</label>
          </div>
          <ErrorMsg msg={errors.comment?.message} />
        </div>
        <div className="tp-product-details-review-input-box">
          <div className="tp-product-details-review-input">
            <input
            {...register("name", { required: `Name is required!` })}
              name="name"
              id="name"
              type="text"
              disabled
              placeholder="Shahnewaz Sakil"
            />
          </div>
          <div className="tp-product-details-review-input-title">
            <label htmlFor="name">Your Name</label>
          </div>
        </div>
        <div className="tp-product-details-review-input-box">
          <div className="tp-product-details-review-input">
            <input
            {...register("email", { required: `Name is required!` })}
              name="email"
              id="email"
              type="email"
              disabled
              placeholder="you@example.com"
            />
          </div>
          <div className="tp-product-details-review-input-title">
            <label htmlFor="email">Your Email</label>
          </div>
        </div>
      </div>
      <div className="tp-product-details-review-btn-wrapper">
        <button type="submit" disabled={isLoading || !accessToken} className="tp-product-details-review-btn">
          {isLoading ? "Submitting..." : "Submit Review"}
        </button>
      </div>
    </form>
  );
};

export default ReviewForm;
