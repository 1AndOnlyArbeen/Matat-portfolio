import { SectionHeading } from '../models/sectionHeading.model.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { apiError } from '../utils/apiError.js';
import { apiResponse } from '../utils/apiResponse.js';

// public — return every section heading as one map keyed by `section`
const getSectionHeadings = asyncHandler(async (req, res) => {
  const list = await SectionHeading.find();
  const map = {};
  list.forEach((h) => { map[h.section] = h; });
  return res
    .status(200)
    .json(new apiResponse(200, map, 'Section headings fetched'));
});

// admin — upsert one heading by section key
const upsertSectionHeading = asyncHandler(async (req, res) => {
  const { section } = req.params;
  if (!section) throw new apiError(400, 'section key is required');

  const {
    label, titlePlain, titleHighlight, subtitle,
    labelHe, titlePlainHe, titleHighlightHe, subtitleHe,
  } = req.body

  const heading = await SectionHeading.findOneAndUpdate(
    { section },
    {
      $set: {
        label: label ?? '',
        titlePlain: titlePlain ?? '',
        titleHighlight: titleHighlight ?? '',
        subtitle: subtitle ?? '',
        labelHe: labelHe ?? '',
        titlePlainHe: titlePlainHe ?? '',
        titleHighlightHe: titleHighlightHe ?? '',
        subtitleHe: subtitleHe ?? '',
      },
    },
    { new: true, upsert: true, setDefaultsOnInsert: true },
  );

  return res
    .status(200)
    .json(new apiResponse(200, heading, 'Section heading saved'));
});

export { getSectionHeadings, upsertSectionHeading };
